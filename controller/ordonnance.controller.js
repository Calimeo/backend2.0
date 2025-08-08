// ESM version: ordonnance.controller.js

import Ordonnance from "../models/Ordonnance.js";

export const createOrdonnance = async (req, res) => {
  try {
    const newOrdonnance = new Ordonnance(req.body);
    await newOrdonnance.save();
    res.status(201).json(newOrdonnance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdonnances = async (req, res) => {
  try {
    const ordonnances = await Ordonnance.find().populate("patient medecin");
    res.json(ordonnances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
