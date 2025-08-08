export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  // 🎭 Nom du cookie en fonction du rôle
  let cookieName = "userToken";
  switch (user.role) {
    case "Admin":
      cookieName = "adminToken";
      break;
    case "Patient":
      cookieName = "patientToken";
      break;
    case "Doctor":
      cookieName = "doctorToken";
      break;
    case "Hospital":
      cookieName = "hospitalToken";
      break;
    default:
      cookieName = "userToken";
  }

  // 🕒 Définir la durée d’expiration
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  };

  // 🔄 Réinitialise les autres cookies pour éviter les conflits entre rôles
  res.clearCookie("adminToken");
  res.clearCookie("patientToken");
  res.clearCookie("doctorToken");
  res.clearCookie("hospitalToken");

  // 🍪 Envoie du cookie avec le bon nom
  res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions)
    .json({
      success: true,
      message,
      user,
      token,
    });
};
