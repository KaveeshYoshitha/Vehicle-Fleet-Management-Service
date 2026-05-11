import bcrypt from "bcryptjs";
import { logAudit } from "../utils/auditLogger.js";
import {
  fetchUsers,
  fetchDrivers,
  fetchUserById,
  fetchUserByIdForUpdate,
  createUser,
  updateUser,
  deactivateUser,
} from "../models/userModel.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const listUsers = async (req, res, next) => {
  try {
    const { role, search, is_active } = req.query;
    const users = await fetchUsers({
      role,
      search,
      isActive:
        is_active !== undefined ? (is_active === "true" ? 1 : 0) : undefined,
    });

    const formatted = users.map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      licenseNumber: u.license_number,
      isActive: !!u.is_active,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const listDrivers = async (req, res, next) => {
  try {
    const users = await fetchDrivers();
    const formatted = users.map((u) => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      licenseNumber: u.license_number,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await fetchUserById(req.params.id);
    if (!user) {
      throw createError(404, "User not found.");
    }

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      licenseNumber: user.license_number,
      isActive: !!user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

export const createUserRecord = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, licenseNumber } =
      req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      throw createError(
        400,
        "First name, last name, email, password, and role are required.",
      );
    }

    const validRoles = ["admin", "fleet_manager", "fleet_staff"];
    if (!validRoles.includes(role)) {
      throw createError(
        400,
        "Invalid role. Must be: admin, fleet_manager, or fleet_staff.",
      );
    }

    if (req.user.role === "fleet_manager" && role === "admin") {
      throw createError(403, "Fleet managers cannot create admin accounts.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = await createUser({
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      phone,
      licenseNumber,
    });

    await logAudit(req.user.id, "USER_CREATED", "user", userId, {
      name: `${firstName} ${lastName}`,
      email,
      role,
    });

    res.status(201).json({
      message: "User created successfully.",
      id: userId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRecord = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      licenseNumber,
      isActive,
    } = req.body;

    const existing = await fetchUserByIdForUpdate(req.params.id);
    if (!existing) {
      throw createError(404, "User not found.");
    }

    if (req.user.role === "fleet_manager") {
      if (existing.role === "admin") {
        throw createError(403, "Fleet managers cannot edit admin accounts.");
      }
      if (role === "admin") {
        throw createError(403, "Fleet managers cannot assign admin role.");
      }
    }

    const updates = {};

    if (firstName !== undefined) {
      updates.first_name = firstName;
    }
    if (lastName !== undefined) {
      updates.last_name = lastName;
    }
    if (email !== undefined) {
      updates.email = email;
    }
    if (role !== undefined) {
      updates.role = role;
    }
    if (phone !== undefined) {
      updates.phone = phone;
    }
    if (licenseNumber !== undefined) {
      updates.license_number = licenseNumber;
    }
    if (isActive !== undefined) {
      updates.is_active = isActive;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updates.password_hash = passwordHash;
    }

    const updated = await updateUser(req.params.id, updates);
    if (!updated) {
      throw createError(400, "No fields to update.");
    }

    await logAudit(
      req.user.id,
      "USER_UPDATED",
      "user",
      parseInt(req.params.id, 10),
      {
        changes: req.body,
      },
    );

    res.json({ message: "User updated successfully." });
  } catch (error) {
    next(error);
  }
};

export const deactivateUserRecord = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id) {
      throw createError(400, "You cannot deactivate your own account.");
    }

    const existing = await fetchUserByIdForUpdate(userId);
    if (!existing) {
      throw createError(404, "User not found.");
    }

    await deactivateUser(userId);

    await logAudit(req.user.id, "USER_DEACTIVATED", "user", userId, {
      name: `${existing.first_name} ${existing.last_name}`,
    });

    res.json({ message: "User deactivated successfully." });
  } catch (error) {
    next(error);
  }
};
