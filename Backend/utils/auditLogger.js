import { pool } from '../config/db.js';

/**
 * Log an action to the audit_logs table
 * @param {number|null} userId - The user performing the action
 * @param {string} action - The action type (e.g., 'VEHICLE_CREATED')
 * @param {string} entityType - The entity type (e.g., 'vehicle', 'user', 'assignment')
 * @param {number|null} entityId - The entity ID
 * @param {object|null} details - Additional details as JSON
 */
export const logAudit = async (userId, action, entityType, entityId, details = null) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    // Don't let audit logging failures break the main operation
    console.error('Audit logging failed:', error.message);
  }
};
