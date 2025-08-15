// controllers/birthController.js
import Birth from "../models/birth.js";

// Ajouter une naissance
export const addBirth = async (req, res) => {
  try {
    const {
      babyName,
      gender,
      birthDate,
      motherName,
      fatherName,
      weight,
      notes
    } = req.body;

    const hospitalId = req.user._id; // ID de l’hôpital connecté

    if (!babyName || !gender || !birthDate || !motherName || !weight) {
      return res
        .status(400)
        .json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    const newBirth = new Birth({
      babyName,
      gender,
      birthDate,
      motherName,
      fatherName,
      weight,
      notes,
      hospitalId
    });

    await newBirth.save();
    res
      .status(201)
      .json({ message: "Naissance enregistrée avec succès", data: newBirth });
  } catch (error) {
    console.error("Erreur addBirth:", error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

// Lister toutes les naissances d’un hôpital
export const getBirths = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const births = await Birth.find({ hospitalId }).sort({ birthDate: -1 });
    res.status(200).json({ data: births });
  } catch (error) {
    console.error("Erreur getBirths:", error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

// Modifier une naissance
export const updateBirth = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const birth = await Birth.findOneAndUpdate(
      { _id: id, hospitalId },
      req.body,
      { new: true }
    );

    if (!birth) {
      return res.status(404).json({ message: "Naissance non trouvée" });
    }

    res
      .status(200)
      .json({ message: "Naissance mise à jour avec succès", data: birth });
  } catch (error) {
    console.error("Erreur updateBirth:", error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};

// Supprimer une naissance
export const deleteBirth = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const birth = await Birth.findOneAndDelete({ _id: id, hospitalId });

    if (!birth) {
      return res.status(404).json({ message: "Naissance non trouvée" });
    }

    res.status(200).json({ message: "Naissance supprimée avec succès" });
  } catch (error) {
    console.error("Erreur deleteBirth:", error);
    res
      .status(500)
      .json({ message: "Erreur interne du serveur", error: error.message });
  }
};
