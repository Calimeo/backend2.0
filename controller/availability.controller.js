import DoctorAvailability from "../models/DoctorAvailability.js";
import {User }from "../models/userSchema.js";
import mongoose from 'mongoose';
import { Appointment } from "../models/appointmentSchema.js"; 

// Ajouter une disponibilité (côté docteur ou admin)
export const addAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "Doctor ID et date requis" });
    }

    // Vérifier si le doctor existe
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "Doctor") {
      return res.status(404).json({ message: "Docteur introuvable" });
    }

    // Vérifier si déjà dispo sur cette date
    const existing = await DoctorAvailability.findOne({ doctor: doctorId, date });
    if (existing) {
      return res.status(400).json({ message: "Ce créneau existe déjà" });
    }

    const availability = new DoctorAvailability({ doctor: doctorId, date });
    await availability.save();

    res.status(201).json({ message: "Disponibilité ajoutée", availability });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Voir toutes les disponibilités d’un docteur (patient ou docteur)


export const getDoctorAvailabilities = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log('Doctor ID reçu:', doctorId);
    console.log('Type de doctorId:', typeof doctorId);

    // Essayez d'abord sans conversion
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const query = {
      doctor: doctorId,
      isBooked: false,
      date: { $gte: todayStart }
    };

    console.log('Query:', query);

    const availabilities = await DoctorAvailability.find(query).sort("date");
    
    console.log('Résultats trouvés:', availabilities.length);
    
    res.status(200).json(availabilities);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



export const bookAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.body;
    const patientId = req.user.id; // injecté par middleware auth

    // Vérifier que l’ID est fourni
    if (!availabilityId) {
      return res.status(400).json({ message: "ID de disponibilité requis" });
    }

    const availability = await DoctorAvailability.findById(availabilityId).populate("doctor");

    if (!availability) {
      return res.status(404).json({ message: "Créneau introuvable" });
    }

    // Vérifier que le créneau n’est pas passé
    if (new Date(availability.date) < new Date()) {
      return res.status(400).json({ message: "Impossible de réserver un créneau passé" });
    }

    // Vérifier si déjà réservé
    if (availability.isBooked) {
      return res.status(400).json({ message: "Ce créneau est déjà réservé" });
    }

    // Marquer comme réservé
    availability.isBooked = true;
    await availability.save();

    // Créer un rendez-vous lié
    const appointment = new Appointment({
      patient: patientId,
      doctor: availability.doctor._id,
      availability: availability._id,
      date: availability.date,
      status: "booked",
    });

    await appointment.save();

    res.status(200).json({
      message: "Créneau réservé avec succès",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// Voir toutes les réservations d’un patient
export const getPatientBookings = async (req, res) => {
  try {
    const patientId = req.user.id;

    const bookings = await DoctorAvailability.find({ isBooked: true })
      .populate("doctor", "name email")
      .sort("date");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const getMyAvailabilities = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const slots = await DoctorAvailability.find({ doctor: req.user._id });
    res.status(200).json(slots);
  } catch (error) {
    console.error("Erreur récupération disponibilités:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
