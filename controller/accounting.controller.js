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
