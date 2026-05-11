import { pool } from "../config/db.js";

export const fetchUserByEmail = async (email) => {
  const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return users[0] || null;
};

export const fetchUserProfileById = async (userId) => {
  const [users] = await pool.query(
    "SELECT id, first_name, last_name, email, role, phone, license_number, is_active, created_at FROM users WHERE id = ?",
    [userId],
  );
  return users[0] || null;
};
