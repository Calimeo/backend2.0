// ESM version: hopital.controller.js

import Hopital from "../models/Hopital.js";

export const createHopital = async (req, res) => {
  try {
    const newHopital = new Hopital(req.body);
    await newHopital.save();
    res.status(201).json(newHopital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHopitaux = async (req, res) => {
  try {
    const hopitaux = await Hopital.find();
    res.json(hopitaux);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
