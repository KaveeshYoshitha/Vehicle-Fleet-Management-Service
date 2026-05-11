import { pool } from "../config/db.js";

export const fetchUsers = async ({ role, search, isActive }) => {
  let query =
    "SELECT id, first_name, last_name, email, role, phone, license_number, is_active, created_at, updated_at FROM users WHERE 1=1";
  const params = [];

  if (role) {
    query += " AND role = ?";
    params.push(role);
  }

  if (isActive !== undefined) {
    query += " AND is_active = ?";
    params.push(isActive);
  }

  if (search) {
    query +=
      " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY created_at DESC";

  const [users] = await pool.query(query, params);
  return users;
};

export const fetchDrivers = async () => {
  const [users] = await pool.query(
    "SELECT id, first_name, last_name, email, phone, license_number FROM users WHERE role = ? AND is_active = TRUE ORDER BY first_name",
    ["fleet_staff"],
  );
  return users;
};

export const fetchUserById = async (userId) => {
  const [users] = await pool.query(
    "SELECT id, first_name, last_name, email, role, phone, license_number, is_active, created_at, updated_at FROM users WHERE id = ?",
    [userId],
  );
  return users[0] || null;
};

export const fetchUserByIdForUpdate = async (userId) => {
  const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
    userId,
  ]);
  return users[0] || null;
};

export const createUser = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  role,
  phone,
  licenseNumber,
}) => {
  const [result] = await pool.query(
    "INSERT INTO users (first_name, last_name, email, password_hash, role, phone, license_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      phone || null,
      licenseNumber || null,
    ],
  );
  return result.insertId;
};

export const updateUser = async (userId, updates) => {
  const columns = Object.keys(updates);
  if (columns.length === 0) {
    return false;
  }

  const values = columns.map((column) => updates[column]);
  const setClause = columns.map((column) => `${column} = ?`).join(", ");
  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [
    ...values,
    userId,
  ]);
  return true;
};

export const deactivateUser = async (userId) => {
  await pool.query("UPDATE users SET is_active = FALSE WHERE id = ?", [userId]);
};
