import DoctorAvailability from "../models/DoctorAvailability.js";

// 📌 Ajouter des disponibilités (docteur)
export const addAvailability = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { dates } = req.body; // Tableau de dates ex: ["2025-08-15T09:00", "2025-08-15T10:00"]

    const slots = dates.map(date => ({
      doctor: req.user._id,
      date
    }));

    const createdSlots = await DoctorAvailability.insertMany(slots);

    res.status(201).json({ message: "Disponibilités ajoutées", createdSlots });
  } catch (error) {
    console.error("Erreur ajout disponibilités:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Voir ses propres disponibilités (docteur)
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

// 📌 Voir les disponibilités d'un docteur (patients)
export const getDoctorAvailabilities = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const slots = await DoctorAvailability.find({ doctor: doctorId, isBooked: false });
    res.status(200).json(slots);
  } catch (error) {
    console.error("Erreur récupération disponibilités médecin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
