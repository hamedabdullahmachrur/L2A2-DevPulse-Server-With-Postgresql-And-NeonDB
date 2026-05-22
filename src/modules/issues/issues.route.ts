import { Router } from "express";
import { createIssue, deleteIssue, getAllIssues, getIssueById, updateIssue } from "./issues.controller";
import { authenticate } from "../../middlewere/auth";
import { requireMaintainer } from "../../middlewere/roleGuard";

const router = Router()

router.post('/', authenticate, createIssue);


export const issuesRoute = router 