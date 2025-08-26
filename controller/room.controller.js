import Room from "../models/room.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

// Créer une nouvelle chambre
export const createRoom = catchAsyncErrors(async (req, res, next) => {
  const { number, name, type, capacity, floor, wing, features, notes } = req.body;
  const hospitalId = req.user._id;

  // Vérifier que l'utilisateur est un hôpital
  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Vérifier si la chambre existe déjà
  const existingRoom = await Room.findOne({
    number,
    hospital: hospitalId
  });

  if (existingRoom) {
    return next(new ErrorHandler('Une chambre avec ce numéro existe déjà.', 400));
  }

  // Créer la chambre
  const room = await Room.create({
    number,
    name,
    type,
    capacity,
    floor,
    wing,
    features,
    notes,
    hospital: hospitalId,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Chambre créée avec succès',
    room
  });
});

// Ajouter un lit à une chambre
export const addBedToRoom = catchAsyncErrors(async (req, res, next) => {
  const { roomId } = req.params;
  const { number, notes } = req.body;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Trouver la chambre
  const room = await Room.findOne({
    _id: roomId,
    hospital: hospitalId
  });

  if (!room) {
    return next(new ErrorHandler('Chambre non trouvée', 404));
  }

  // Vérifier si le lit existe déjà
  const bedExists = room.beds.some(bed => bed.number === number);
  if (bedExists) {
    return next(new ErrorHandler('Un lit avec ce numéro existe déjà dans cette chambre.', 400));
  }

  // Vérifier la capacité
  if (room.beds.length >= room.capacity) {
    return next(new ErrorHandler('La chambre a atteint sa capacité maximale.', 400));
  }

  // Ajouter le lit
  room.beds.push({
    number,
    notes
  });

  await room.save();
  await room.updateRoomStatus();

  res.status(200).json({
    success: true,
    message: 'Lit ajouté avec succès',
    room
  });
});



// Obtenir toutes les chambres de l'hôpital
export const getHospitalRooms = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { page = 1, limit = 10, type, status, search } = req.query;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Construire le filtre
  let filter = { hospital: hospitalId };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { number: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { floor: { $regex: search, $options: 'i' } },
      { wing: { $regex: search, $options: 'i' } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { number: 1 },
    populate: [
      { path: 'beds.patient', select: 'firstName lastName' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]
  };

  try {
    // Utiliser la pagination correctement
    const rooms = await Room.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Erreur pagination:', error);
    // Fallback: utiliser find() si paginate échoue
    const rooms = await Room.find(filter)
      .populate('beds.patient', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ number: 1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        docs: rooms,
        totalDocs: total,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  }
});

// Alternative sans pagination (plus simple)
export const getHospitalRoomsSimple = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { type, status, search } = req.query;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Construire le filtre
  let filter = { hospital: hospitalId };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { number: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { floor: { $regex: search, $options: 'i' } },
      { wing: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const rooms = await Room.find(filter)
      .populate('beds.patient', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName')
      .populate('hospital', 'name email phone')
      .sort({ number: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    console.error('Erreur récupération chambres:', error);
    return next(new ErrorHandler('Erreur lors de la récupération des chambres', 500));
  }
});

// Les autres fonctions du contrôleur restent les mêmes...

// Obtenir une chambre spécifique
export const getRoom = catchAsyncErrors(async (req, res, next) => {
  const { roomId } = req.params;
  const hospitalId = req.user._id;

  const room = await Room.findOne({
    _id: roomId,
    hospital: hospitalId
  }).populate([
    { path: 'beds.patient', select: 'firstName lastName email phone' },
    { path: 'createdBy', select: 'firstName lastName' },
    { path: 'hospital', select: 'name email phone' }
  ]);

  if (!room) {
    return next(new ErrorHandler('Chambre non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    room
  });
});

// Mettre à jour une chambre
export const updateRoom = catchAsyncErrors(async (req, res, next) => {
  const { roomId } = req.params;
  const hospitalId = req.user._id;
  const updateData = req.body;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const room = await Room.findOneAndUpdate(
    {
      _id: roomId,
      hospital: hospitalId
    },
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('beds.patient', 'firstName lastName');

  if (!room) {
    return next(new ErrorHandler('Chambre non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Chambre mise à jour avec succès',
    room
  });
});

// Supprimer une chambre
export const deleteRoom = catchAsyncErrors(async (req, res, next) => {
  const { roomId } = req.params;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const room = await Room.findOne({
    _id: roomId,
    hospital: hospitalId
  });

  if (!room) {
    return next(new ErrorHandler('Chambre non trouvée', 404));
  }

  // Vérifier s'il y a des patients dans les lits
  const occupiedBeds = room.beds.filter(bed => bed.status === "occupied");
  if (occupiedBeds.length > 0) {
    return next(new ErrorHandler('Impossible de supprimer une chambre avec des patients.', 400));
  }

  await Room.findByIdAndDelete(roomId);

  res.status(200).json({
    success: true,
    message: 'Chambre supprimée avec succès'
  });
});

// Mettre à jour le statut d'un lit
export const updateBedStatus = catchAsyncErrors(async (req, res, next) => {
  const { roomId, bedId } = req.params;
  const { status, patientId, notes } = req.body;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const room = await Room.findOne({
    _id: roomId,
    hospital: hospitalId
  });

  if (!room) {
    return next(new ErrorHandler('Chambre non trouvée', 404));
  }

  const bed = room.beds.id(bedId);
  if (!bed) {
    return next(new ErrorHandler('Lit non trouvé', 404));
  }

  // Validation pour l'occupation
  if (status === "occupied" && !patientId) {
    return next(new ErrorHandler('Un patient est requis pour occuper un lit.', 400));
  }

  if (status === "occupied") {
    // Vérifier si le patient existe
    const patient = await User.findOne({
      _id: patientId,
      role: "Patient"
    });

    if (!patient) {
      return next(new ErrorHandler('Patient non trouvé', 404));
    }

    bed.patient = patientId;
  } else {
    bed.patient = null;
  }

  bed.status = status;
  if (notes) bed.notes = notes;

  await room.save();
  await room.updateRoomStatus();

  const updatedRoom = await Room.findById(roomId)
    .populate('beds.patient', 'firstName lastName email phone');

  res.status(200).json({
    success: true,
    message: 'Statut du lit mis à jour avec succès',
    room: updatedRoom
  });
});

// Obtenir les statistiques des chambres
export const getRoomStats = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const stats = await Room.aggregate([
    { $match: { hospital: hospitalId } },
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        totalBeds: { $sum: { $size: "$beds" } },
        availableBeds: {
          $sum: {
            $size: {
              $filter: {
                input: "$beds",
                as: "bed",
                cond: { $eq: ["$$bed.status", "available"] }
              }
            }
          }
        },
        occupiedBeds: {
          $sum: {
            $size: {
              $filter: {
                input: "$beds",
                as: "bed",
                cond: { $eq: ["$$bed.status", "occupied"] }
              }
            }
          }
        },
        byType: {
          $push: {
            type: "$type",
            count: 1,
            beds: { $size: "$beds" }
          }
        }
      }
    }
  ]);

  const typeStats = await Room.aggregate([
    { $match: { hospital: hospitalId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalBeds: { $sum: { $size: "$beds" } },
        availableBeds: {
          $sum: {
            $size: {
              $filter: {
                input: "$beds",
                as: "bed",
                cond: { $eq: ["$$bed.status", "available"] }
              }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    stats: stats[0] || {},
    typeStats
  });
});