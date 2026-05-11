import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listVehicles,
  getVehicleStats,
  getVehicle,
  createVehicleRecord,
  updateVehicleRecord,
  retireVehicleRecord,
} from "../controllers/vehicleController.js";

const router = express.Router();
router.use(authenticate);
router.get("/", listVehicles);
router.get("/stats", getVehicleStats);
router.get("/:id", getVehicle);
router.post("/", authorize("admin", "fleet_manager"), createVehicleRecord);
router.put("/:id", authorize("admin", "fleet_manager"), updateVehicleRecord);
router.delete("/:id", authorize("admin", "fleet_manager"), retireVehicleRecord);

export default router;
