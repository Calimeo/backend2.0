import Admission from "../models/Admission.js";
import Room from "../models/room.js";
import Patient from "../models/Patient.js"; // Import du modèle Patient
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import mongoose from "mongoose";

// Admettre un patient
export const admitPatient = catchAsyncErrors(async (req, res, next) => {
  const {
    patientId,
    roomId,
    bedId,
    reason,
    diagnosis,
    doctorId,
    notes
  } = req.body;

  const hospitalId = req.user._id;

  // Vérifications
  if (req.user.role !== 'Hospital' && req.user.role !== 'Doctor') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux et médecins.', 403));
  }

  // Vérifier le patient - Utilisation du modèle Patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return next(new ErrorHandler('Patient non trouvé', 404));
  }

  // Vérifier le médecin - Reste sur User pour les docteurs
  const doctor = await User.findOne({
    _id: doctorId,
    role: "Doctor"
  });

  if (!doctor) {
    return next(new ErrorHandler('Médecin non trouvé', 404));
  }

  // Vérifier la chambre et le lit
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

  // Vérifier si le lit est disponible
  if (bed.status !== "available") {
    return next(new ErrorHandler('Le lit n\'est pas disponible', 400));
  }

  // Vérifier si le patient est déjà admis
  const existingAdmission = await Admission.findOne({
    patient: patientId,
    status: "admitted"
  });

  if (existingAdmission) {
    return next(new ErrorHandler('Le patient est déjà admis', 400));
  }

  try {
    // Commencer une transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    // Mettre à jour le statut du lit
    bed.status = "occupied";
    bed.patient = patientId;
    await room.save({ session });

    // Mettre à jour le statut de la chambre
    await room.updateRoomStatus();

    // Créer l'admission
    const admission = await Admission.create([{
      patient: patientId,
      room: roomId,
      bed: bedId,
      reason,
      diagnosis,
      doctor: doctorId,
      notes,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Récupérer l'admission avec les données populées
    const populatedAdmission = await Admission.findById(admission[0]._id)
      .populate("patient", "firstName lastName email phone")
      .populate("room", "number name type")
      .populate("doctor", "firstName lastName")
      .populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      message: 'Patient admis avec succès',
      data: populatedAdmission
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur admission:', error);
    return next(new ErrorHandler('Erreur lors de l\'admission', 500));
  }
});

// Libérer un lit (décharge)
export const dischargePatient = catchAsyncErrors(async (req, res, next) => {
  const { admissionId } = req.params;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital' && req.user.role !== 'Doctor') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux et médecins.', 403));
  }

  const admission = await Admission.findById(admissionId)
    .populate("room");

  if (!admission) {
    return next(new ErrorHandler('Admission non trouvée', 404));
  }

  // Vérifier que l'admission appartient à l'hôpital
  if (admission.room.hospital.toString() !== hospitalId.toString()) {
    return next(new ErrorHandler('Accès non autorisé', 403));
  }

  if (admission.status === "discharged") {
    return next(new ErrorHandler('Le patient est déjà déchargé', 400));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Mettre à jour le statut du lit
    const room = await Room.findById(admission.room._id);
    const bed = room.beds.id(admission.bed);
    
    if (bed) {
      bed.status = "available";
      bed.patient = null;
      await room.save({ session });
      await room.updateRoomStatus();
    }

    // Mettre à jour l'admission
    admission.status = "discharged";
    admission.dischargeDate = new Date();
    await admission.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedAdmission = await Admission.findById(admissionId)
      .populate("patient", "firstName lastName email phone")
      .populate("room", "number name type")
      .populate("doctor", "firstName lastName");

    res.status(200).json({
      success: true,
      message: 'Patient déchargé avec succès',
      data: populatedAdmission
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur décharge:', error);
    return next(new ErrorHandler('Erreur lors de la décharge', 500));
  }
});

// Obtenir les admissions actives
export const getActiveAdmissions = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const admissions = await Admission.find({ status: "admitted" })
    .populate({
      path: "room",
      match: { hospital: hospitalId },
      select: "number name type"
    })
    .populate("patient", "firstName lastName email phone") // Population du modèle Patient
    .populate("doctor", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .sort({ admissionDate: -1 });

  // Filtrer les admissions qui appartiennent à cet hôpital
  const filteredAdmissions = admissions.filter(admission => admission.room !== null);

  res.status(200).json({
    success: true,
    count: filteredAdmissions.length,
    data: filteredAdmissions
  });
});

// Obtenir l'historique des admissions
export const getAdmissionHistory = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { page = 1, limit = 10, patientId, status } = req.query;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  let filter = {};

  if (patientId) {
    filter.patient = patientId;
  }

  if (status) {
    filter.status = status;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { admissionDate: -1 },
    populate: [
      {
        path: "room",
        match: { hospital: hospitalId },
        select: "number name type"
      },
      { path: "patient", select: "firstName lastName email phone" }, // Population Patient
      { path: "doctor", select: "firstName lastName" },
      { path: "createdBy", select: "firstName lastName" }
    ]
  };

  try {
    const admissions = await Admission.paginate(filter, options);
    
    // Filtrer les résultats pour n'inclure que les admissions de cet hôpital
    const filteredDocs = admissions.docs.filter(admission => admission.room !== null);

    res.status(200).json({
      success: true,
      data: {
        docs: filteredDocs,
        totalDocs: filteredDocs.length,
        limit: admissions.limit,
        page: admissions.page,
        totalPages: Math.ceil(filteredDocs.length / admissions.limit)
      }
    });

  } catch (error) {
    // Fallback sans pagination
    const admissions = await Admission.find(filter)
      .populate({
        path: "room",
        match: { hospital: hospitalId },
        select: "number name type"
      })
      .populate("patient", "firstName lastName email phone") // Population Patient
      .populate("doctor", "firstName lastName")
      .populate("createdBy", "firstName lastName")
      .sort({ admissionDate: -1 });

    const filteredAdmissions = admissions.filter(admission => admission.room !== null);

    res.status(200).json({
      success: true,
      count: filteredAdmissions.length,
      data: filteredAdmissions
    });
  }
});

// Obtenir une admission spécifique
export const getAdmission = catchAsyncErrors(async (req, res, next) => {
  const { admissionId } = req.params;
  const hospitalId = req.user._id;

  const admission = await Admission.findById(admissionId)
    .populate({
      path: "room",
      match: { hospital: hospitalId },
      select: "number name type floor wing"
    })
    .populate("patient", "firstName lastName email phone nic dob gender") // Population Patient
    .populate("doctor", "firstName lastName specialty")
    .populate("createdBy", "firstName lastName");

  if (!admission || !admission.room) {
    return next(new ErrorHandler('Admission non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    data: admission
  });
});

// Transférer un patient
export const transferPatient = catchAsyncErrors(async (req, res, next) => {
  const { admissionId } = req.params;
  const { newRoomId, newBedId, reason } = req.body;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital' && req.user.role !== 'Doctor') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux et médecins.', 403));
  }

  if (!newRoomId || !newBedId || !reason) {
    return next(new ErrorHandler('Nouvelle chambre, lit et raison sont requis', 400));
  }

  const admission = await Admission.findById(admissionId)
    .populate("room");

  if (!admission) {
    return next(new ErrorHandler('Admission non trouvée', 404));
  }

  if (admission.room.hospital.toString() !== hospitalId.toString()) {
    return next(new ErrorHandler('Accès non autorisé', 403));
  }

  // Vérifier la nouvelle chambre et le nouveau lit
  const newRoom = await Room.findOne({
    _id: newRoomId,
    hospital: hospitalId
  });

  if (!newRoom) {
    return next(new ErrorHandler('Nouvelle chambre non trouvée', 404));
  }

  const newBed = newRoom.beds.id(newBedId);
  if (!newBed) {
    return next(new ErrorHandler('Nouveau lit non trouvé', 404));
  }

  if (newBed.status !== "available") {
    return next(new ErrorHandler('Le nouveau lit n\'est pas disponible', 400));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Libérer l'ancien lit
    const oldRoom = await Room.findById(admission.room._id);
    const oldBed = oldRoom.beds.id(admission.bed);
    
    if (oldBed) {
      oldBed.status = "available";
      oldBed.patient = null;
      await oldRoom.save({ session });
      await oldRoom.updateRoomStatus();
    }

    // Occuper le nouveau lit
    newBed.status = "occupied";
    newBed.patient = admission.patient;
    await newRoom.save({ session });
    await newRoom.updateRoomStatus();

    // Mettre à jour l'admission
    admission.room = newRoomId;
    admission.bed = newBedId;
    admission.notes = admission.notes ? `${admission.notes}\nTransfert: ${reason}` : `Transfert: ${reason}`;
    await admission.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedAdmission = await Admission.findById(admissionId)
      .populate("patient", "firstName lastName email phone") // Population Patient
      .populate("room", "number name type")
      .populate("doctor", "firstName lastName");

    res.status(200).json({
      success: true,
      message: 'Patient transféré avec succès',
      data: populatedAdmission
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur transfert:', error);
    return next(new ErrorHandler('Erreur lors du transfert', 500));
  }
});