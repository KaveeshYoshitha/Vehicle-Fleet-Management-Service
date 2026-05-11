import { logAudit } from "../utils/auditLogger.js";
import {
  fetchVehicles,
  fetchVehicleStats,
  fetchVehicleById,
  fetchVehicleAssignments,
  createVehicle,
  updateVehicle,
  fetchActiveAssignmentsByVehicleId,
  retireVehicle,
} from "../models/vehicleModel.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const listVehicles = async (req, res, next) => {
  try {
    const { type, status, search, fuel_type } = req.query;
    const vehicles = await fetchVehicles({
      type,
      status,
      search,
      fuelType: fuel_type,
    });

    const formatted = vehicles.map((v) => ({
      id: v.id,
      plateNumber: v.plate_number,
      make: v.make,
      model: v.model,
      year: v.year,
      type: v.type,
      customType: v.custom_type,
      fuelType: v.fuel_type,
      purchaseCost: v.purchase_cost,
      status: v.status,
      notes: v.notes,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
      currentAssignment: v.active_assignment_id
        ? {
            assignmentId: v.active_assignment_id,
            driverId: v.driver_id,
            driverName: `${v.driver_first_name} ${v.driver_last_name}`,
            assignedAt: v.assigned_at,
          }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getVehicleStats = async (req, res, next) => {
  try {
    const statsResult = await fetchVehicleStats();

    const stats = {
      totalVehicles: statsResult.totalVehicles[0].total,
      totalDrivers: statsResult.totalDrivers[0].total,
      totalUsers: statsResult.totalUsers[0].total,
      activeAssignments: statsResult.activeAssignments[0].total,
      byStatus: {},
    };

    statsResult.statusCounts.forEach((row) => {
      stats.byStatus[row.status] = row.count;
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await fetchVehicleById(req.params.id);
    if (!vehicle) {
      throw createError(404, "Vehicle not found.");
    }

    const assignments = await fetchVehicleAssignments(req.params.id);

    res.json({
      id: vehicle.id,
      plateNumber: vehicle.plate_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      customType: vehicle.custom_type,
      fuelType: vehicle.fuel_type,
      purchaseCost: vehicle.purchase_cost,
      status: vehicle.status,
      notes: vehicle.notes,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
      assignments: assignments.map((a) => ({
        id: a.id,
        driverId: a.driver_id,
        driverName: `${a.dfn} ${a.dln}`,
        assignedBy: `${a.abfn} ${a.abln}`,
        assignedAt: a.assigned_at,
        returnedAt: a.returned_at,
        returnedBy: a.returned_by ? `${a.rbfn} ${a.rbln}` : null,
        notes: a.notes,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createVehicleRecord = async (req, res, next) => {
  try {
    const {
      plateNumber,
      make,
      model,
      year,
      type,
      customType,
      fuelType,
      purchaseCost,
      notes,
    } = req.body;
    if (!plateNumber || !make || !model || !year || !type) {
      throw createError(
        400,
        "Plate number, make, model, year, and type are required.",
      );
    }
    if (type === "other" && !customType) {
      throw createError(400, 'Custom type is required when type is "other".');
    }

    const vehicleId = await createVehicle({
      plateNumber,
      make,
      model,
      year,
      type,
      customType,
      fuelType,
      purchaseCost,
      notes,
    });

    await logAudit(req.user.id, "VEHICLE_CREATED", "vehicle", vehicleId, {
      plateNumber,
      make,
      model,
    });
    res
      .status(201)
      .json({ message: "Vehicle created successfully.", id: vehicleId });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleRecord = async (req, res, next) => {
  try {
    const existing = await fetchVehicleById(req.params.id);
    if (!existing) {
      throw createError(404, "Vehicle not found.");
    }

    const {
      plateNumber,
      make,
      model,
      year,
      type,
      customType,
      fuelType,
      purchaseCost,
      status,
      notes,
    } = req.body;
    const updates = {};

    if (plateNumber !== undefined) {
      updates.plate_number = plateNumber;
    }
    if (make !== undefined) {
      updates.make = make;
    }
    if (model !== undefined) {
      updates.model = model;
    }
    if (year !== undefined) {
      updates.year = year;
    }
    if (type !== undefined) {
      updates.type = type;
    }
    if (customType !== undefined) {
      updates.custom_type = customType;
    }
    if (fuelType !== undefined) {
      updates.fuel_type = fuelType;
    }
    if (purchaseCost !== undefined) {
      updates.purchase_cost = purchaseCost;
    }
    if (status !== undefined) {
      updates.status = status;
    }
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const updated = await updateVehicle(req.params.id, updates);
    if (!updated) {
      throw createError(400, "No fields to update.");
    }

    await logAudit(
      req.user.id,
      "VEHICLE_UPDATED",
      "vehicle",
      parseInt(req.params.id, 10),
      { changes: req.body },
    );
    res.json({ message: "Vehicle updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const retireVehicleRecord = async (req, res, next) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    const existing = await fetchVehicleById(vehicleId);
    if (!existing) {
      throw createError(404, "Vehicle not found.");
    }

    const activeAssignments =
      await fetchActiveAssignmentsByVehicleId(vehicleId);
    if (activeAssignments.length > 0) {
      throw createError(
        400,
        "Cannot retire a vehicle that is currently assigned.",
      );
    }

    await retireVehicle(vehicleId);

    await logAudit(req.user.id, "VEHICLE_RETIRED", "vehicle", vehicleId, {
      plateNumber: existing.plate_number,
    });
    res.json({ message: "Vehicle retired successfully." });
  } catch (error) {
    next(error);
  }
};
