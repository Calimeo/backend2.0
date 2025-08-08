// ESM version: lit.controller.js

import Lit from "../models/Lit.js";

export const createLit = async (req, res) => {
  try {
    const newLit = new Lit(req.body);
    await newLit.save();
    res.status(201).json(newLit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLits = async (req, res) => {
  try {
    const lits = await Lit.find().populate("chambre");
    res.json(lits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
