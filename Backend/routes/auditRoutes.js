import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { listAuditLogs } from "../controllers/auditController.js";

const router = express.Router();
router.use(authenticate);

router.get("/", authorize("admin"), listAuditLogs);

export default router;
