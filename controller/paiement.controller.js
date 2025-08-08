// ESM version: paiement.controller.js

import Paiement from "../models/Paiement.js";

export const createPaiement = async (req, res) => {
  try {
    const paiement = new Paiement(req.body);
    await paiement.save();
    res.status(201).json(paiement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find().populate("patient");
    res.json(paiements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
