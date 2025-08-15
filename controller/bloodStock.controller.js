import BloodStock from "../models/bloodStock.js";

// ➕ Ajouter une poche de sang
export const addBloodStock = async (req, res) => {
  try {
    const { bloodType, quantity, expiryDate } = req.body;
    const hospitalId = req.user._id; // supposons que l'hôpital est authentifié

    const blood = new BloodStock({ hospitalId, bloodType, quantity, expiryDate });
    await blood.save();

    res.status(201).json({ message: "Stock de sang ajouté avec succès", blood });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📜 Lister le stock de sang de l’hôpital connecté
export const getBloodStockByHospital = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const stock = await BloodStock.find({ hospitalId }).sort({ createdAt: -1 });

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ✏️ Mettre à jour une entrée
export const updateBloodStock = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const updated = await BloodStock.findOneAndUpdate(
      { _id: id, hospitalId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Stock introuvable" });

    res.json({ message: "Stock mis à jour", updated });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// ❌ Supprimer une entrée
export const deleteBloodStock = async (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.user._id;

    const deleted = await BloodStock.findOneAndDelete({ _id: id, hospitalId });

    if (!deleted) return res.status(404).json({ message: "Stock introuvable" });

    res.json({ message: "Stock supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
