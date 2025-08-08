import Room from "../models/room.js";

// Obtenir toutes les chambres
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer une chambre
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Room.findOne({ name });

    if (existing) {
      return res.status(400).json({ message: "Cette chambre existe déjà." });
    }

    const room = new Room({ name, beds: [] });
    await room.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une chambre
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await Room.findByIdAndDelete(id);
    res.status(200).json({ message: "Chambre supprimée." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un lit à une chambre
export const addBed = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { number } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Chambre introuvable." });

    if (room.beds.some((bed) => bed.number.toLowerCase() === number.toLowerCase())) {
      return res.status(400).json({ message: "Ce lit existe déjà." });
    }

    room.beds.push({ number });
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un lit
export const deleteBed = async (req, res) => {
  try {
    const { roomId, bedId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Chambre non trouvée." });

    room.beds = room.beds.filter((bed) => bed._id.toString() !== bedId);
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bascule la disponibilité d’un lit
export const toggleBedAvailability = async (req, res) => {
  try {
    const { roomId, bedId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Chambre non trouvée." });

    const bed = room.beds.id(bedId);
    if (!bed) return res.status(404).json({ message: "Lit introuvable." });

    bed.available = !bed.available;
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
