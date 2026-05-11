import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listAssignments,
  getAssignment,
  assignVehicle,
  returnVehicle,
} from "../controllers/assignmentController.js";

const router = express.Router();
router.use(authenticate);

router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.post(
  "/",
  authorize("admin", "fleet_manager", "fleet_staff"),
  assignVehicle,
);
router.put(
  "/:id/return",
  authorize("admin", "fleet_manager", "fleet_staff"),
  returnVehicle,
);

export default router;
