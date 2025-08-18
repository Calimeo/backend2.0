import mongoose from "mongoose";
import Death from "../models/death.js";

// Helper pour valider les ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 📌 Enregistrer un décès
export const addDeath = async (req, res) => {
  try {
    // Validation de l'authentification
    if (!req.user?._id) {
      return res.status(401).json({ 
        success: false,
        message: "Authentification requise" 
      });
    }

    const {
      patientName,
      patientId,
      causeOfDeath,
      dateOfDeath,
      responsiblePerson,
      notes
    } = req.body;

    // Validation des champs obligatoires
    const requiredFields = { patientName, causeOfDeath, dateOfDeath, responsiblePerson };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs manquants: ${missingFields.join(", ")}`,
        fields: missingFields
      });
    }

    // Validation de l'ID patient si fourni
    if (patientId && !isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "ID patient invalide"
      });
    }

    // Création du décès
    const deathRecord = new Death({
      patientName,
      patientId: patientId || null,
      causeOfDeath,
      dateOfDeath: new Date(dateOfDeath),
      hospitalId: req.user._id,
      responsiblePerson,
      notes: notes || ""
    });

    await deathRecord.save();

    res.status(201).json({
      success: true,
      message: "Décès enregistré avec succès",
      data: deathRecord
    });

  } catch (error) {
    console.error("Erreur addDeath:", error);
    
    // Gestion spécifique des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'enregistrement",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 📌 Lister les décès d'un hôpital
export const getDeathsByHospital = async (req, res) => {
  try {
    // Utilisation de l'ID de l'hôpital depuis le token
    const hospitalId = req.user._id;

    if (!isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "ID hôpital invalide"
      });
    }

    const deaths = await Death.find({ hospitalId })
      .sort({ dateOfDeath: -1 })
      .lean(); // Conversion en objet JS simple

    res.status(200).json({
      success: true,
      count: deaths.length,
      data: deaths
    });

  } catch (error) {
    console.error("Erreur getDeathsByHospital:", error);
    
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des données",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 📌 Supprimer un décès
export const deleteDeath = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID décès invalide"
      });
    }

    // Vérifie que le décès appartient à l'hôpital demandeur
    const death = await Death.findOneAndDelete({
      _id: id,
      hospitalId: req.user._id
    });

    if (!death) {
      return res.status(404).json({
        success: false,
        message: "Décès introuvable ou non autorisé"
      });
    }

    res.status(200).json({
      success: true,
      message: "Décès supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur deleteDeath:", error);
    
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};