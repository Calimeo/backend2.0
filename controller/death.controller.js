import Death from "../models/death.js";

// 📌 Enregistrer un décès
export const addDeath = async (req, res) => {
  try {
    // Vérifie que l'utilisateur est bien connecté
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    const {
      patientName,
      patientId,
      causeOfDeath,
      dateOfDeath,
      responsiblePerson,
      notes
    } = req.body;

    const hospitalId = req.user._id; // Hôpital connecté

    // Vérifie les champs obligatoires
    if (![patientName, causeOfDeath, dateOfDeath, responsiblePerson].every(Boolean)) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    // Création du décès
    const newDeath = new Death({
      patientName,
      patientId: patientId || null,
      causeOfDeath,
      dateOfDeath: new Date(dateOfDeath), // Convertit en objet Date
      hospitalId,
      responsiblePerson,
      notes: notes || ""
    });

    await newDeath.save();

    res.status(201).json({
      message: "Décès enregistré avec succès",
      data: newDeath
    });

  } catch (error) {
    console.error("Erreur addDeath:", error);
    res.status(500).json({
      message: "Erreur interne du serveur",
      error: error.message
    });
  }
};


// 📌 Lister les décès d'un hôpital
export const getDeathsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const deaths = await Death.find({ hospitalId }).sort({ dateOfDeath: -1 });
    res.status(200).json(deaths);
  } catch (error) {
    console.error("Erreur getDeathsByHospital:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// 📌 Supprimer un décès
export const deleteDeath = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Death.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Décès introuvable" });
    }
    res.status(200).json({ message: "Décès supprimé avec succès" });
  } catch (error) {
    console.error("Erreur deleteDeath:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
