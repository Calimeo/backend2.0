// ESM version: medecin.controller.js

import Medecin from "../models/Medecin.js";

export const createMedecin = async (req, res) => {
  try {
    const newMedecin = new Medecin(req.body);
    await newMedecin.save();
    res.status(201).json(newMedecin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMedecins = async (req, res) => {
  try {
    const medecins = await Medecin.find().populate("user");
    res.json(medecins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
