// ESM version: parametre.controller.js

import Parametre from "../models/Parametre.js";

export const setParametre = async (req, res) => {
  try {
    const param = await Parametre.findOneAndUpdate(
      { cle: req.body.cle },
      { valeur: req.body.valeur },
      { upsert: true, new: true }
    );
    res.status(200).json(param);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getParametres = async (req, res) => {
  try {
    const params = await Parametre.find();
    res.json(params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
