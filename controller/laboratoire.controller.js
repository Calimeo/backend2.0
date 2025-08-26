// controllers/laboratoryController.js
import Laboratory from "../models/laboratoire.js";
import Patient from "../models/Patient.js";

// ✅ Créer un laboratoire (associé automatiquement à l'hôpital de l'utilisateur)
export const createLaboratory = async (req, res) => {
  try {
    const { name, department } = req.body;
    const hospitalId = req.user._id; // ID de l'hôpital connecté

    const lab = await Laboratory.create({ 
      name, 
      department, 
      hospital: hospitalId 
    });
    
    res.status(201).json({ 
      message: "Laboratoire créé avec succès", 
      lab 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// ✅ Lister tous les laboratoires de l'hôpital connecté
export const getLaboratories = async (req, res) => {
  try {
    const hospitalId = req.user._id; // ID de l'hôpital connecté

    const labs = await Laboratory.find({ hospital: hospitalId })
      .populate("hospital", "name email")
      .populate("patients", "name email")
      .populate("tests.patient", "name email");
    
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// ✅ Ajouter un patient dans un laboratoire (vérification que le lab appartient à l'hôpital)
export const addPatientToLaboratory = async (req, res) => {
  try {
    const { labId, patientId } = req.body;
    const hospitalId = req.user._id; // ID de l'hôpital connecté

    // Vérifier que le laboratoire appartient à l'hôpital connecté
    const lab = await Laboratory.findOne({ 
      _id: labId, 
      hospital: hospitalId 
    });
    
    if (!lab) {
      return res.status(404).json({ 
        message: "Laboratoire introuvable ou non autorisé" 
      });
    }

    const patient = await Patient.findOne({ 
      _id: patientId, 
      hospital: hospitalId 
    });
    
    if (!patient) {
      return res.status(404).json({ 
        message: "Patient introuvable ou non autorisé" 
      });
    }

    if (!lab.patients.includes(patientId)) {
      lab.patients.push(patientId);
      await lab.save();
    }

    res.status(200).json({ 
      message: "Patient ajouté au laboratoire", 
      lab 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// ✅ Ajouter un test pour un patient (vérification des permissions)
export const addTestResult = async (req, res) => {
  try {
    const { labId, patientId, testName, result } = req.body;
    const hospitalId = req.user._id; // ID de l'hôpital connecté

    // Vérifier que le laboratoire appartient à l'hôpital connecté
    const lab = await Laboratory.findOne({ 
      _id: labId, 
      hospital: hospitalId 
    });
    
    if (!lab) {
      return res.status(404).json({ 
        message: "Laboratoire introuvable ou non autorisé" 
      });
    }

    // Vérifier que le patient appartient à l'hôpital connecté
    const patient = await Patient.findOne({ 
      _id: patientId, 
      hospital: hospitalId 
    });
    
    if (!patient) {
      return res.status(404).json({ 
        message: "Patient introuvable ou non autorisé" 
      });
    }

    // Ajouter le test
    lab.tests.push({ 
      testName, 
      result, 
      patient: patientId,
      date: new Date()
    });
    
    // Ajouter le patient s'il n'est pas déjà dans le labo
    if (!lab.patients.includes(patientId)) {
      lab.patients.push(patientId);
    }

    await lab.save();
    
    res.status(201).json({ 
      message: "Résultat ajouté avec succès", 
      lab 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// ✅ Récupérer un laboratoire spécifique (avec vérification de permission)
export const getLaboratoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const lab = await Laboratory.findOne({ 
      _id: id, 
      hospital: hospitalId 
    })
    .populate("hospital", "name email")
    .populate("patients", "name email phone")
    .populate("tests.patient", "name email");

    if (!lab) {
      return res.status(404).json({ 
        message: "Laboratoire introuvable" 
      });
    }

    res.status(200).json(lab);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// ✅ Supprimer un laboratoire (uniquement pour l'hôpital propriétaire)
export const deleteLaboratory = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const lab = await Laboratory.findOneAndDelete({ 
      _id: id, 
      hospital: hospitalId 
    });

    if (!lab) {
      return res.status(404).json({ 
        message: "Laboratoire introuvable ou non autorisé" 
      });
    }

    res.status(200).json({ 
      message: "Laboratoire supprimé avec succès" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};