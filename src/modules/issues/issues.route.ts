import { Router } from "express";
import { createIssue, getAllIssues, getIssueById, updateIssue } from "./issues.controller";
import { authenticate } from "../../middlewere/auth";
import { requireMaintainer } from "../../middlewere/roleGuard";

const router = Router()
// Public routes
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Authenticated routes (contributor + maintainer)
router.post('/', authenticate, createIssue);

// Authenticated — special permission logic handled inside the controller
router.patch('/:id', authenticate, updateIssue);

export const issuesRoute = router 