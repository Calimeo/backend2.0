// ESM version: activite.controller.js

import Activite from "../models/Activite.js";

export const logActivite = async (req, res) => {
  try {
    const act = new Activite(req.body);
    await act.save();
    res.status(201).json(act);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivites = async (req, res) => {
  try {
    const activites = await Activite.find().populate("utilisateur");
    res.json(activites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
