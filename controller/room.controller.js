import Room from "../models/room.js";

// Middleware de vérification (à utiliser dans vos routes)
export const checkHospitalAdmin = (req, res, next) => {
  if (!req.user?.hospital) {
    return res.status(403).json({ message: "Accès réservé aux administrateurs d'hôpital" });
  }
  next();
};

// Obtenir toutes les chambres de l'hôpital
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 'beds.hospital': req.user.hospital._id })
      .populate('beds.hospital');
    
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Créer une chambre
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    const existingRoom = await Room.findOne({ 
      name,
      'beds.hospital': req.user.hospital._id 
    });

    if (existingRoom) {
      return res.status(400).json({ 
        message: "Une chambre avec ce nom existe déjà dans votre hôpital." 
      });
    }

    const room = new Room({ 
      name,
      beds: []
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un lit
export const addBed = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { number } = req.body;

    const room = await Room.findOne({
      _id: roomId,
      'beds.hospital': req.user.hospital._id
    });

    if (!room) {
      return res.status(404).json({ message: "Chambre introuvable ou non autorisée." });
    }

    const bedExists = room.beds.some(
      bed => bed.number === number && bed.hospital.equals(req.user.hospital._id)
    );

    if (bedExists) {
      return res.status(400).json({ 
        message: "Ce lit existe déjà dans cette chambre." 
      });
    }

    room.beds.push({ 
      number,
      hospital: req.user.hospital._id, // Ici on utilise bien hospital._id
      available: true
    });

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

    const room = await Room.findOne({
      _id: roomId,
      'beds.hospital': req.user.hospital._id
    });
    
    if (!room) {
      return res.status(404).json({ message: "Chambre non trouvée ou non autorisée." });
    }

    const bed = room.beds.id(bedId);
    if (!bed || !bed.hospital.equals(req.user.hospital._id)) {
      return res.status(404).json({ message: "Lit non trouvé ou non autorisé." });
    }

    bed.remove();
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basculer disponibilité
export const toggleBedAvailability = async (req, res) => {
  try {
    const { roomId, bedId } = req.params;

    const room = await Room.findOne({
      _id: roomId,
      'beds.hospital': req.user.hospital._id
    });

    if (!room) {
      return res.status(404).json({ message: "Chambre non trouvée ou non autorisée." });
    }

    const bed = room.beds.id(bedId);
    if (!bed || !bed.hospital.equals(req.user.hospital._id)) {
      return res.status(404).json({ message: "Lit non trouvé ou non autorisé." });
    }

    bed.available = !bed.available;
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une chambre
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findOneAndDelete({
      _id: roomId,
      'beds.hospital': req.user.hospital._id
    });

    if (!room) {
      return res.status(404).json({ 
        message: "Chambre introuvable ou non autorisée." 
      });
    }

    res.status(200).json({ message: "Chambre supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};