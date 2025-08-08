const Hopital = require("../models/Hopital");

exports.createHopital = async (req, res) => {
  try {
    const hopital = await Hopital.create(req.body);
    res.status(201).json(hopital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllHopitaux = async (req, res) => {
  try {
    const hopitaux = await Hopital.find();
    res.json(hopitaux);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
