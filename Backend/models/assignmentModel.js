import { pool } from "../config/db.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const fetchAssignments = async ({ vehicleId, driverId, status }) => {
  let query = `
    SELECT a.*,
      v.plate_number, v.make, v.model,
      d.first_name as driver_first_name, d.last_name as driver_last_name,
      ab.first_name as assigned_by_first_name, ab.last_name as assigned_by_last_name,
      rb.first_name as returned_by_first_name, rb.last_name as returned_by_last_name
    FROM assignments a
    JOIN vehicles v ON a.vehicle_id = v.id
    JOIN users d ON a.driver_id = d.id
    JOIN users ab ON a.assigned_by = ab.id
    LEFT JOIN users rb ON a.returned_by = rb.id
    WHERE 1=1
  `;
  const params = [];

  if (vehicleId) {
    query += " AND a.vehicle_id = ?";
    params.push(vehicleId);
  }
  if (driverId) {
    query += " AND a.driver_id = ?";
    params.push(driverId);
  }
  if (status === "active") {
    query += " AND a.returned_at IS NULL";
  }
  if (status === "returned") {
    query += " AND a.returned_at IS NOT NULL";
  }

  query += " ORDER BY a.assigned_at DESC";
  const [assignments] = await pool.query(query, params);
  return assignments;
};

export const fetchAssignmentById = async (assignmentId) => {
  const [assignments] = await pool.query(
    `
    SELECT a.*, v.plate_number, v.make, v.model,
      d.first_name as dfn, d.last_name as dln,
      ab.first_name as abfn, ab.last_name as abln,
      rb.first_name as rbfn, rb.last_name as rbln
    FROM assignments a
    JOIN vehicles v ON a.vehicle_id = v.id
    JOIN users d ON a.driver_id = d.id
    JOIN users ab ON a.assigned_by = ab.id
    LEFT JOIN users rb ON a.returned_by = rb.id
    WHERE a.id = ?
  `,
    [assignmentId],
  );

  return assignments[0] || null;
};

export const createAssignment = async ({
  vehicleId,
  driverId,
  assignedBy,
  notes,
}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [vehicles] = await connection.query(
      "SELECT * FROM vehicles WHERE id = ? FOR UPDATE",
      [vehicleId],
    );
    if (vehicles.length === 0) {
      throw createError(404, "Vehicle not found.");
    }
    if (vehicles[0].status !== "available") {
      throw createError(
        409,
        `Vehicle is currently ${vehicles[0].status}. Cannot assign.`,
      );
    }

    const [active] = await connection.query(
      "SELECT id FROM assignments WHERE vehicle_id = ? AND returned_at IS NULL",
      [vehicleId],
    );
    if (active.length > 0) {
      throw createError(409, "Vehicle already has an active assignment.");
    }

    const [drivers] = await connection.query(
      "SELECT id, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE",
      [driverId],
    );
    if (drivers.length === 0) {
      throw createError(404, "Driver not found or inactive.");
    }

    const [result] = await connection.query(
      "INSERT INTO assignments (vehicle_id, driver_id, assigned_by, notes) VALUES (?, ?, ?, ?)",
      [vehicleId, driverId, assignedBy, notes || null],
    );

    await connection.query(
      "UPDATE vehicles SET status = 'assigned' WHERE id = ?",
      [vehicleId],
    );

    await connection.commit();

    return {
      assignmentId: result.insertId,
      vehiclePlate: vehicles[0].plate_number,
      driverName: `${drivers[0].first_name} ${drivers[0].last_name}`,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const returnAssignment = async ({ assignmentId, returnedBy }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [assignments] = await connection.query(
      "SELECT a.*, v.plate_number FROM assignments a JOIN vehicles v ON a.vehicle_id = v.id WHERE a.id = ? AND a.returned_at IS NULL FOR UPDATE",
      [assignmentId],
    );
    if (assignments.length === 0) {
      throw createError(404, "Active assignment not found.");
    }

    const assignment = assignments[0];
    await connection.query(
      "UPDATE assignments SET returned_at = NOW(), returned_by = ? WHERE id = ?",
      [returnedBy, assignmentId],
    );
    await connection.query(
      "UPDATE vehicles SET status = 'available' WHERE id = ?",
      [assignment.vehicle_id],
    );

    await connection.commit();

    return {
      vehiclePlate: assignment.plate_number,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
