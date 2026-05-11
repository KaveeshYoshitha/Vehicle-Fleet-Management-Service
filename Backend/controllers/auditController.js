import { fetchAuditLogs } from "../models/auditModel.js";

export const listAuditLogs = async (req, res, next) => {
  try {
    const { action, entity_type, user_id, limit = 50, offset = 0 } = req.query;
    const logs = await fetchAuditLogs({
      action,
      entityType: entity_type,
      userId: user_id,
      limit,
      offset,
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      userId: l.user_id,
      userName: l.first_name ? `${l.first_name} ${l.last_name}` : "System",
      userEmail: l.email,
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id,
      details: l.details,
      createdAt: l.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};
