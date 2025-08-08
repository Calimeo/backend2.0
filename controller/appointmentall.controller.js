// ✅ controllers/appointment.controller.js
import Appointment from "../models/Appointment.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// 📝 Créer un nouveau rendez-vous
export const createAppointment = catchAsyncErrors(async (req, res, next) => {
  const { doctor, date, reason } = req.body;

  if (!doctor || !date || !reason) {
    return next(new ErrorHandler("Tous les champs sont requis", 400));
  }

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor,
    date,
    reason,
  });

  res.status(201).json({ success: true, appointment });
});

// 📋 Voir les rendez-vous du patient
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find({ patient: req.user._id })
    .populate("doctor", "name email")
    .sort({ date: -1 });

  res.status(200).json({ success: true, appointments });
});

// ✅ Supprimer un rendez-vous (optionnel)
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment || appointment.patient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Rendez-vous introuvable ou non autorisé", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({ success: true, message: "Rendez-vous supprimé" });
});

// ✅ Modifier un rendez-vous (optionnel)
export const updateAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment || appointment.patient.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Rendez-vous introuvable ou non autorisé", 404));
  }

  const { date, reason } = req.body;
  if (date) appointment.date = date;
  if (reason) appointment.reason = reason;

  await appointment.save();
  res.status(200).json({ success: true, appointment });
});
