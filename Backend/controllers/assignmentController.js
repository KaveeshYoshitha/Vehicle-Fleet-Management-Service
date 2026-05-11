import { logAudit } from "../utils/auditLogger.js";
import {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  returnAssignment,
} from "../models/assignmentModel.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const listAssignments = async (req, res, next) => {
  try {
    const { vehicle_id, driver_id, status } = req.query;
    const assignments = await fetchAssignments({
      vehicleId: vehicle_id,
      driverId: driver_id,
      status,
    });

    const formatted = assignments.map((a) => ({
      id: a.id,
      vehicleId: a.vehicle_id,
      vehiclePlate: a.plate_number,
      vehicleName: `${a.make} ${a.model}`,
      driverId: a.driver_id,
      driverName: `${a.driver_first_name} ${a.driver_last_name}`,
      assignedBy: `${a.assigned_by_first_name} ${a.assigned_by_last_name}`,
      assignedAt: a.assigned_at,
      returnedAt: a.returned_at,
      returnedBy: a.returned_by
        ? `${a.returned_by_first_name} ${a.returned_by_last_name}`
        : null,
      notes: a.notes,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getAssignment = async (req, res, next) => {
  try {
    const assignment = await fetchAssignmentById(req.params.id);
    if (!assignment) {
      throw createError(404, "Assignment not found.");
    }

    res.json({
      id: assignment.id,
      vehicleId: assignment.vehicle_id,
      vehiclePlate: assignment.plate_number,
      vehicleName: `${assignment.make} ${assignment.model}`,
      driverId: assignment.driver_id,
      driverName: `${assignment.dfn} ${assignment.dln}`,
      assignedBy: `${assignment.abfn} ${assignment.abln}`,
      assignedAt: assignment.assigned_at,
      returnedAt: assignment.returned_at,
      returnedBy: assignment.returned_by
        ? `${assignment.rbfn} ${assignment.rbln}`
        : null,
      notes: assignment.notes,
    });
  } catch (error) {
    next(error);
  }
};

export const assignVehicle = async (req, res, next) => {
  try {
    const { vehicleId, driverId, notes } = req.body;
    if (!vehicleId || !driverId) {
      throw createError(400, "Vehicle ID and driver ID are required.");
    }

    const result = await createAssignment({
      vehicleId,
      driverId,
      assignedBy: req.user.id,
      notes,
    });

    await logAudit(
      req.user.id,
      "ASSIGNMENT_CREATED",
      "assignment",
      result.assignmentId,
      {
        vehicle: result.vehiclePlate,
        driver: result.driverName,
      },
    );

    res
      .status(201)
      .json({
        message: "Vehicle assigned successfully.",
        id: result.assignmentId,
      });
  } catch (error) {
    next(error);
  }
};

export const returnVehicle = async (req, res, next) => {
  try {
    const result = await returnAssignment({
      assignmentId: req.params.id,
      returnedBy: req.user.id,
    });

    await logAudit(
      req.user.id,
      "ASSIGNMENT_RETURNED",
      "assignment",
      parseInt(req.params.id, 10),
      {
        vehicle: result.vehiclePlate,
      },
    );

    res.json({ message: "Vehicle returned successfully." });
  } catch (error) {
    next(error);
  }
};
