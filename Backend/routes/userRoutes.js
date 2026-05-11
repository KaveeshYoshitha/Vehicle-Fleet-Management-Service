import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listUsers,
  listDrivers,
  getUser,
  createUserRecord,
  updateUserRecord,
  deactivateUserRecord,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authenticate);
router.get("/", authorize("admin", "fleet_manager"), listUsers);
router.get(
  "/drivers",
  authorize("admin", "fleet_manager", "fleet_staff"),
  listDrivers,
);
router.get("/:id", authorize("admin", "fleet_manager"), getUser);
router.post("/", authorize("admin", "fleet_manager"), createUserRecord);
router.put("/:id", authorize("admin", "fleet_manager"), updateUserRecord);
router.delete("/:id", authorize("admin"), deactivateUserRecord);

export default router;
