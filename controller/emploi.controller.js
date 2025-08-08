// ESM version: emploi.controller.js

import Emploi from "../models/Emploi.js";

export const createEmploi = async (req, res) => {
  try {
    const emploi = new Emploi(req.body);
    await emploi.save();
    res.status(201).json(emploi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmplois = async (req, res) => {
  try {
    const emplois = await Emploi.find().populate("medecin");
    res.json(emplois);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
