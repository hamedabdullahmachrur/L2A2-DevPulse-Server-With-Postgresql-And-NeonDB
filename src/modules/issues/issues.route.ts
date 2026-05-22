import { Router } from "express";
import { createIssue,  getAllIssues, getIssueById } from "./issues.controller";
import { authenticate } from "../../middlewere/auth";
import { requireMaintainer } from "../../middlewere/roleGuard";

const router = Router()
// Public routes
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Authenticated routes (contributor + maintainer)
router.post('/', authenticate, createIssue);


export const issuesRoute = router 