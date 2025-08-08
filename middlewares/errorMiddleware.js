// errorMiddleware.js

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Valeurs par défaut
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 💥 Erreur de doublon MongoDB
  if (err.code === 11000) {
    message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
    statusCode = 400;
  }

  // 💥 JWT invalide
  if (err.name === "JsonWebTokenError") {
    message = "JSON Web Token is invalid. Try again!";
    statusCode = 400;
  }

  // 💥 JWT expiré
  if (err.name === "TokenExpiredError") {
    message = "JSON Web Token has expired. Please log in again.";
    statusCode = 400;
  }

  // 💥 Mauvais format d’ID MongoDB
  if (err.name === "CastError") {
    message = `Invalid ${err.path}`;
    statusCode = 400;
  }

  // 💥 Validation mongoose
  if (err.errors) {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
    statusCode = 400;
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default ErrorHandler;
