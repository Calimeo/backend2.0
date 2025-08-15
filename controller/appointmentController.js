import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import DoctorAvailability from "../models/DoctorAvailability.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendMail.js";



export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});
export const updateAppointment = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "Appointment Status Updated!",
    });
  }
);
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});



export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
  try {
    const patientId = req.user._id;

    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'fullName specialty hospital') // populate info du médecin
      .sort({ date: -1 });
       if (!appointments) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  };

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous :', error);
    res.status(500).json({ message: "Erreur serveur lors du chargement des rendez-vous" });
  }
});


export const deleteAppointmentByPatient = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const patientId = req.user._id;

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  if (appointment.patientId.toString() !== patientId.toString()) {
    return next(new ErrorHandler("Not authorized to delete this appointment", 403));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
  });
});


export const getDoctorAppointments = async (req, res) => {
  const doctorId = req.user._id; // Récupéré depuis le token

  try {
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email") // On peut ajouter d'autres infos du patient
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



// POST /api/v1/appointments/send-appointment/:doctorId
export const sendAppointment = async (req, res) => {
  const doctorId = req.params.doctorId;
  const patientId = req.user._id; // récupéré via authMiddleware
  const { date, reason } = req.body;

  try {
    // Vérifier si le médecin existe
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "Doctor") {
      return res.status(404).json({ message: "Médecin introuvable" });
    }

    // Créer le rendez-vous
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date,
      reason,
    });

    await appointment.save();

    res.status(201).json({
      message: "Rendez-vous envoyé avec succès",
      appointment,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du rendez-vous:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.params;
  const { status } = req.body;
  const userId = req.user._id; // Récupéré via authMiddleware
  const userRole = req.user.role;

  // Vérifier si le status est valide
  const validStatuses = ["pending", "accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous introuvable" });
    }

    // Vérifie si c’est bien le médecin assigné qui fait la mise à jour
    if (userRole !== "Doctor" || appointment.doctor.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    // Mettre à jour le statut
    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      message: `Statut du rendez-vous mis à jour en "${status}"`,
      appointment,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const bookAppointment = async (req, res) => {
  try {
    const { availabilityId, reason } = req.body;
    const patientId = req.user._id;

    const slot = await DoctorAvailability.findById(availabilityId).populate("doctor");

    if (!slot || slot.isBooked) {
      return res.status(400).json({ message: "Créneau indisponible" });
    }

    const appointment = new Appointment({
      patient: patientId,
      doctor: slot.doctor._id,
      date: slot.date,
      reason
    });

    await appointment.save();

    // Marquer le créneau comme réservé
    slot.isBooked = true;
    await slot.save();

    // Envoi d'email au docteur
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"MediLink" <${process.env.EMAIL_USER}>`,
      to: slot.doctor.email,
      subject: "Nouveau rendez-vous réservé",
      text: `Vous avez un nouveau rendez-vous le ${slot.date}.\nRaison: ${reason}`
    });

    res.status(201).json({ message: "Rendez-vous réservé avec succès", appointment });
  } catch (error) {
    console.error("Erreur réservation rendez-vous:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
