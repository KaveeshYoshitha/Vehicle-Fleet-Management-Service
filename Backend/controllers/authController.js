import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logAudit } from "../utils/auditLogger.js";
import { fetchUserByEmail, fetchUserProfileById } from "../models/authModel.js";

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, "Email and password are required.");
    }

    const user = await fetchUserByEmail(email);
    if (!user) {
      throw createError(401, "Invalid email or password.");
    }

    if (!user.is_active) {
      throw createError(
        403,
        "Account has been deactivated. Contact an administrator.",
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw createError(401, "Invalid email or password.");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );

    await logAudit(user.id, "USER_LOGIN", "user", user.id, {
      email: user.email,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await fetchUserProfileById(req.user.id);
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
      isActive: user.is_active,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};
