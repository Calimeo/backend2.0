// ESM version: dossier.controller.js

import Dossier from "../models/Dossier.js";

export const createDossier = async (req, res) => {
  try {
    const dossier = new Dossier(req.body);
    await dossier.save();
    res.status(201).json(dossier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDossiers = async (req, res) => {
  try {
    const dossiers = await Dossier.find().populate("patient");
    res.json(dossiers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
