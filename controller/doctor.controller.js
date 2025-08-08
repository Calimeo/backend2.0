import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Ajouter un médecin lié à un hôpital
export const addDoctorToHospital = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id; // l'hôpital connecté

  if (req.user.role !== "Hospital") {
    return next(new ErrorHandler("Accès refusé : seuls les hôpitaux peuvent ajouter un médecin", 403));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (!firstName || !lastName || !email || !phone || !password || !doctorDepartment) {
    return next(new ErrorHandler("Tous les champs obligatoires ne sont pas fournis", 400));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Ce médecin existe déjà", 400));
  }

  const newDoctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    hospitalId: hospitalId,
  });

  res.status(201).json({
    success: true,
    message: "Médecin ajouté avec succès",
    doctor: newDoctor,
  });
});

export const getDoctorsByHospital = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id; // L'hôpital connecté via token

  // Vérifie que l'utilisateur est bien un hôpital
  if (req.user.role !== "Hospital") {
    return next(new ErrorHandler("Accès refusé. Réservé aux hôpitaux.", 403));
  }

  const doctors = await User.find({
    role: "Doctor",
    hospitalId: hospitalId,
  }).select("-password"); // on ne renvoie pas le mot de passe

  res.status(200).json({
    success: true,
    doctors,
  });
});