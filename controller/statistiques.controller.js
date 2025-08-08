// ESM version: statistiques.controller.js

import Statistique from "../models/Statistique.js";

export const createStatistique = async (req, res) => {
  try {
    const stat = new Statistique(req.body);
    await stat.save();
    res.status(201).json(stat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistiques = async (req, res) => {
  try {
    const stats = await Statistique.find();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
