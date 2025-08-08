import Patient from "../models/Patient.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// 🔹 Enregistrer un patient
export const createPatient = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Hospital") {
    return next(new ErrorHandler("Accès refusé", 403));
  }

  const patient = await Patient.create({
    ...req.body,
    hospital: req.user._id,
  });

  res.status(201).json({ message: "Patient enregistré", patient });
});

// 🔹 Lister les patients de l'hôpital (avec recherche)
export const getPatientsByHospital = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role !== "Hospital") {
    return next(new ErrorHandler("Accès refusé", 403));
  }

  const search = req.query.search || "";

  const query = {
    hospital: req.user._id,
    $or: [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  };

  const patients = await Patient.find(query).sort({ createdAt: -1 });
  res.status(200).json({ patients });
});

// 🔹 Modifier un patient
export const updatePatient = catchAsyncErrors(async (req, res, next) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: req.params.id, hospital: req.user._id },
    req.body,
    { new: true }
  );

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

  res.json({ message: "Patient mis à jour", patient });
});

// 🔹 Supprimer un patient
export const deletePatient = catchAsyncErrors(async (req, res, next) => {
  const patient = await Patient.findOneAndDelete({
    _id: req.params.id,
    hospital: req.user._id,
  });

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

  res.json({ message: "Patient supprimé" });
});
