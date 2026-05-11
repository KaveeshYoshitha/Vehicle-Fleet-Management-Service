import { pool } from "../config/db.js";

export const fetchVehicles = async ({ type, status, search, fuelType }) => {
  let query = `
    SELECT v.*,
      a.id as active_assignment_id, a.driver_id, a.assigned_at,
      u.first_name as driver_first_name, u.last_name as driver_last_name
    FROM vehicles v
    LEFT JOIN assignments a ON v.id = a.vehicle_id AND a.returned_at IS NULL
    LEFT JOIN users u ON a.driver_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (type) {
    query += " AND v.type = ?";
    params.push(type);
  }
  if (status) {
    query += " AND v.status = ?";
    params.push(status);
  }
  if (fuelType) {
    query += " AND v.fuel_type = ?";
    params.push(fuelType);
  }
  if (search) {
    query +=
      " AND (v.plate_number LIKE ? OR v.make LIKE ? OR v.model LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  query += " ORDER BY v.created_at DESC";
  const [vehicles] = await pool.query(query, params);
  return vehicles;
};

export const fetchVehicleStats = async () => {
  const [statusCounts] = await pool.query(
    "SELECT status, COUNT(*) as count FROM vehicles GROUP BY status",
  );
  const [totalVehicles] = await pool.query(
    "SELECT COUNT(*) as total FROM vehicles",
  );
  const [totalDrivers] = await pool.query(
    "SELECT COUNT(*) as total FROM users WHERE role = 'fleet_staff' AND is_active = TRUE",
  );
  const [activeAssignments] = await pool.query(
    "SELECT COUNT(*) as total FROM assignments WHERE returned_at IS NULL",
  );
  const [totalUsers] = await pool.query(
    "SELECT COUNT(*) as total FROM users WHERE is_active = TRUE",
  );

  return {
    statusCounts,
    totalVehicles,
    totalDrivers,
    activeAssignments,
    totalUsers,
  };
};

export const fetchVehicleById = async (vehicleId) => {
  const [vehicles] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [
    vehicleId,
  ]);
  return vehicles[0] || null;
};

export const fetchVehicleAssignments = async (vehicleId) => {
  const [assignments] = await pool.query(
    `
    SELECT a.*,
      d.first_name as dfn, d.last_name as dln,
      ab.first_name as abfn, ab.last_name as abln,
      rb.first_name as rbfn, rb.last_name as rbln
    FROM assignments a
    JOIN users d ON a.driver_id = d.id
    JOIN users ab ON a.assigned_by = ab.id
    LEFT JOIN users rb ON a.returned_by = rb.id
    WHERE a.vehicle_id = ?
    ORDER BY a.assigned_at DESC
  `,
    [vehicleId],
  );
  return assignments;
};

export const createVehicle = async ({
  plateNumber,
  make,
  model,
  year,
  type,
  customType,
  fuelType,
  purchaseCost,
  notes,
}) => {
  const [result] = await pool.query(
    "INSERT INTO vehicles (plate_number, make, model, year, type, custom_type, fuel_type, purchase_cost, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      plateNumber,
      make,
      model,
      year,
      type,
      type === "other" ? customType : null,
      fuelType || "petrol",
      purchaseCost || null,
      notes || null,
    ],
  );
  return result.insertId;
};

export const updateVehicle = async (vehicleId, updates) => {
  const columns = Object.keys(updates);
  if (columns.length === 0) {
    return false;
  }

  const values = columns.map((column) => updates[column]);
  const setClause = columns.map((column) => `${column} = ?`).join(", ");
  await pool.query(`UPDATE vehicles SET ${setClause} WHERE id = ?`, [
    ...values,
    vehicleId,
  ]);
  return true;
};

export const fetchActiveAssignmentsByVehicleId = async (vehicleId) => {
  const [assignments] = await pool.query(
    "SELECT id FROM assignments WHERE vehicle_id = ? AND returned_at IS NULL",
    [vehicleId],
  );
  return assignments;
};

export const retireVehicle = async (vehicleId) => {
  await pool.query("UPDATE vehicles SET status = 'retired' WHERE id = ?", [
    vehicleId,
  ]);
};
