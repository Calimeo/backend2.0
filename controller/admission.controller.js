import Admission from "../models/Admission.js";
import Room from "../models/room.js";

// ➕ Ajouter une admission avec vérification disponibilité lit
export const addAdmission = async (req, res) => {
  try {
    const { patientName, admissionDate, room, bed } = req.body;

    // Trouver la chambre
    const foundRoom = await Room.findOne({ name: room });
    if (!foundRoom) {
      return res.status(404).json({ message: "Chambre introuvable." });
    }

    // Trouver le lit
    const foundBed = foundRoom.beds.find((b) => b.number === bed);
    if (!foundBed) {
      return res.status(404).json({ message: "Lit introuvable dans cette chambre." });
    }

    // Vérifier si le lit est disponible
    if (!foundBed.available) {
      return res.status(400).json({ message: "Ce lit est déjà occupé." });
    }

    // Créer l'admission
    const newAdmission = await Admission.create({
      patientName,
      admissionDate,
      room,
      bed,
      status: "admitted",
    });

    // Marquer le lit comme occupé
    foundBed.available = false;
    await foundRoom.save();

    res.status(201).json(newAdmission);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📥 Récupérer toutes les admissions
export const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ admissionDate: -1 });
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✅ Marquer comme sorti + libérer le lit
export const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    if (admission.status === "discharged") {
      return res.status(400).json({ message: "Le patient est déjà sorti." });
    }

    admission.dischargeDate = new Date().toISOString().split("T")[0];
    admission.status = "discharged";
    await admission.save();

    // Libérer le lit associé
    const foundRoom = await Room.findOne({ name: admission.room });
    if (foundRoom) {
      const foundBed = foundRoom.beds.find((b) => b.number === admission.bed);
      if (foundBed) {
        foundBed.available = true;
        await foundRoom.save();
      }
    }

    res.status(200).json(admission);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
