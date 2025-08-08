// controllers/nurseController.js
import Nurse from "../models/nurse.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// ➕ Ajouter une infirmière
export const addNurse = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return next(new ErrorHandler("Nom et email requis", 400));
  }

  const existing = await Nurse.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Infirmière déjà enregistrée", 400));
  }

  const nurse = await Nurse.create({ name, email, phone });
  res.status(201).json({ success: true, message: "Infirmière ajoutée", nurse });
});

// 📋 Lister toutes les infirmières
export const getAllNurses = catchAsyncErrors(async (req, res) => {
  const nurses = await Nurse.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, nurses });
});

// ✏️ Modifier une infirmière
export const updateNurse = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const nurse = await Nurse.findById(id);

  if (!nurse) {
    return next(new ErrorHandler("Infirmière non trouvée", 404));
  }

  const { name, email, phone } = req.body;
  nurse.name = name || nurse.name;
  nurse.email = email || nurse.email;
  nurse.phone = phone || nurse.phone;

  await nurse.save();
  res.status(200).json({ success: true, message: "Infirmière mise à jour", nurse });
});

// ❌ Supprimer une infirmière
export const deleteNurse = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const nurse = await Nurse.findById(id);
  if (!nurse) {
    return next(new ErrorHandler("Infirmière non trouvée", 404));
  }

  await nurse.deleteOne();
  res.status(200).json({ success: true, message: "Infirmière supprimée" });
});

// ✅ Marquer la présence
export const togglePresence = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const nurse = await Nurse.findById(id);
  if (!nurse) {
    return next(new ErrorHandler("Infirmière non trouvée", 404));
  }

  nurse.present = !nurse.present;
  await nurse.save();

  res.status(200).json({
    success: true,
    message: `Présence mise à jour (${nurse.present ? "Présente" : "Absente"})`,
    nurse,
  });
});
