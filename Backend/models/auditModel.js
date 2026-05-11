import { pool } from "../config/db.js";

export const fetchAuditLogs = async ({
  action,
  entityType,
  userId,
  limit = 50,
  offset = 0,
}) => {
  let query = `
    SELECT al.*, u.first_name, u.last_name, u.email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (action) {
    query += " AND al.action = ?";
    params.push(action);
  }
  if (entityType) {
    query += " AND al.entity_type = ?";
    params.push(entityType);
  }
  if (userId) {
    query += " AND al.user_id = ?";
    params.push(userId);
  }

  query += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [logs] = await pool.query(query, params);
  return logs;
};
