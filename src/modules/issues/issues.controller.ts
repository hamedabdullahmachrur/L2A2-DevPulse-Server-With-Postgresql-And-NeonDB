import type { Request, Response } from "express";
import { queryMany, queryOne } from "../../utils/dbQuery";
import type { CreateIssueBody, GetIssuesQuery, Issue, IssueWithReporter, UpdateIssueBody, UserRole } from "../../types";
import { StatusCodes } from "http-status-codes";
import { sendError, sendSuccess } from "../../utils/responseHelper";

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const reporters = await queryMany<{ id: number; name: string; role: UserRole }>(
    'SELECT id, name, role FROM users WHERE id = ANY($1)',
    [reporterIds]
  );

  // Build a lookup map for O(1) access
  const reporterMap = new Map(reporters.map((r) => [r.id, r]));

  return issues.map(({ reporter_id, ...issue }) => ({
    ...issue,
    reporter: reporterMap.get(reporter_id) ?? { id: reporter_id, name: 'Unknown', role: 'contributor' },
  }));
};

// ─── POST /api/issues ─────────────────────────────────────────────────────────
export const createIssue = async (req: Request, res: Response): Promise<void> => {
  const { title, description, type }: CreateIssueBody = req.body;
  const reporterId = req.user!.id;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!title || !description || !type) {
    sendError(res, 'Title, description, and type are required.', StatusCodes.BAD_REQUEST);
    return;
  }

  if (title.length > 150) {
    sendError(res, 'Title must not exceed 150 characters.', StatusCodes.BAD_REQUEST);
    return;
  }

  if (description.length < 20) {
    sendError(res, 'Description must be at least 20 characters.', StatusCodes.BAD_REQUEST);
    return;
  }

  if (!['bug', 'feature_request'].includes(type)) {
    sendError(res, 'Type must be bug or feature_request.', StatusCodes.BAD_REQUEST);
    return;
  }

  // ── Validate reporter exists ─────────────────────────────────────────────────
  const reporter = await queryOne('SELECT id FROM users WHERE id = $1', [reporterId]);
  if (!reporter) {
    sendError(res, 'Reporter not found.', StatusCodes.BAD_REQUEST);
    return;
  }

  const newIssue = await queryOne<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, type, reporterId]
  );

  sendSuccess(res, newIssue, 'Issue created successfully', StatusCodes.CREATED);
};

// ─── GET /api/issues ──────────────────────────────────────────────────────────
export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
  const { sort = 'newest', type, status }: GetIssuesQuery = req.query as GetIssuesQuery;

  // ── Build dynamic WHERE clause ───────────────────────────────────────────────
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'oldest' ? 'ASC' : 'DESC';

  const issues = await queryMany<Issue>(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order}`,
    params
  );

  const issuesWithReporters = await attachReporters(issues);

  sendSuccess(res, issuesWithReporters);
};

// ─── GET /api/issues/:id ──────────────────────────────────────────────────────
export const getIssueById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const issue = await queryOne<Issue>('SELECT * FROM issues WHERE id = $1', [id]);

  if (!issue) {
    sendError(res, 'Issue not found.', StatusCodes.NOT_FOUND);
    return;
  }

  const [issueWithReporter] = await attachReporters([issue]);

  sendSuccess(res, issueWithReporter);
};
