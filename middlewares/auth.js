import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import ErrorHandler from "./errorMiddleware.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";

// 🔐 Middleware d'authentification (accepte header ou cookie)
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token;

  // 🟦 Vérifie si le token est dans les headers (type Bearer)
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 🍪 Si pas dans les headers, on vérifie dans les cookies
  if (!token && req.cookies) {
    token =
      req.cookies.patientToken ||
      req.cookies.doctorToken ||
      req.cookies.adminToken ||
      req.cookies.hospitalToken;
  }

  if (!token) {
    return next(new ErrorHandler("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});

// 🎭 Vérifie si l'utilisateur a un rôle autorisé
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(`${req.user.role} not allowed to access this resource!`, 403)
      );
    }
    next();
  };
};
