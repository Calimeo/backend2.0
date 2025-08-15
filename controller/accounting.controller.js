import Accounting from "../models/accounting.js";

// GET all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Accounting.find().sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// POST new transaction
export const createTransaction = async (req, res) => {
  const { type, category, amount, date, description } = req.body;

  if (!type || !category || !amount || !date) {
    return res.status(400).json({ message: "Champs obligatoires manquants" });
  }

  try {
    const transaction = new Accounting({ type, category, amount, date, description });
    await transaction.save();
    res.status(201).json({ message: "Transaction enregistrée", transaction });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création" });
  }
};



// 📌 Ajouter une entrée comptable
export const addAccountingEntry = async (req, res) => {
  try {
    const hospitalId = req.user._id; // récupéré via authMiddleware
    const { type, category, amount, date, description } = req.body;

    if (!type || !category || !amount || !date) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
    }

    const newEntry = new Accounting({
      hospital: hospitalId,
      type,
      category,
      amount,
      date,
      description
    });

    await newEntry.save();
    res.status(201).json({ message: "Entrée ajoutée avec succès", entry: newEntry });
  } catch (error) {
    console.error("Erreur ajout comptabilité :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 Voir les entrées du compte de l'hôpital connecté
export const getMyAccountingEntries = async (req, res) => {
  try {
    const hospitalId = req.user._id; // authMiddleware
    const entries = await Accounting.find({ hospital: hospitalId }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Erreur récupération comptabilité :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
