// controllers/nurseController.js
import Nurse from "../models/nurse.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Ajouter une infirmière
export const addNurse = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const hospitalId = req.user._id;

  // Validation des champs obligatoires
  if (!name || !email) {
    return next(new ErrorHandler('Le nom et l\'email sont obligatoires', 400));
  }

  // Vérifier si l'email existe déjà
  const existingNurse = await Nurse.findOne({ email, hospital: hospitalId });
  if (existingNurse) {
    return next(new ErrorHandler('Une infirmière avec cet email existe déjà', 400));
  }

  const nurse = await Nurse.create({
    name,
    email,
    phone,
    hospital: hospitalId
  });

  res.status(201).json({
    success: true,
    message: 'Infirmière ajoutée avec succès',
    nurse
  });
});

// Lister toutes les infirmières d'un hôpital
export const listNurses = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { search } = req.query;

  // Construction de la requête
  const query = { hospital: hospitalId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const nurses = await Nurse.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: nurses.length,
    nurses
  });
});

// Supprimer une infirmière
export const deleteNurse = catchAsyncErrors(async (req, res, next) => {
  const nurseId = req.params.id;
  const hospitalId = req.user._id;

  const nurse = await Nurse.findOneAndDelete({
    _id: nurseId,
    hospital: hospitalId
  });

  if (!nurse) {
    return next(new ErrorHandler('Infirmière non trouvée', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Infirmière supprimée avec succès'
  });
});

// Planifier les gardes des infirmières
export const scheduleShifts = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { nurseId, date, shiftType } = req.body;

  // Validation des champs
  if (!nurseId || !date || !shiftType) {
    return next(new ErrorHandler('Tous les champs sont obligatoires', 400));
  }

  // Vérifier si l'infirmière existe
  const nurse = await Nurse.findOne({ _id: nurseId, hospital: hospitalId });
  if (!nurse) {
    return next(new ErrorHandler('Infirmière non trouvée', 404));
  }

  // Ajouter la garde à l'infirmière
  nurse.shifts = nurse.shifts || [];
  nurse.shifts.push({
    date: new Date(date),
    shiftType,
    completed: false
  });

  await nurse.save();

  res.status(200).json({
    success: true,
    message: 'Garde planifiée avec succès',
    nurse
  });
});

// Marquer une garde comme terminée
export const completeShift = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { nurseId, shiftId } = req.body;

  // Validation des champs
  if (!nurseId || !shiftId) {
    return next(new ErrorHandler('Tous les champs sont obligatoires', 400));
  }

  // Trouver l'infirmière et la garde
  const nurse = await Nurse.findOne({ _id: nurseId, hospital: hospitalId });
  if (!nurse) {
    return next(new ErrorHandler('Infirmière non trouvée', 404));
  }

  const shift = nurse.shifts.id(shiftId);
  if (!shift) {
    return next(new ErrorHandler('Garde non trouvée', 404));
  }

  // Marquer comme terminée et enregistrer les heures
  shift.completed = true;
  shift.completedAt = new Date();

  // Calculer la durée de la garde (8 heures par défaut)
  const hoursWorked = 8;
  nurse.totalHours = (nurse.totalHours || 0) + hoursWorked;

  await nurse.save();

  res.status(200).json({
    success: true,
    message: 'Garde marquée comme terminée',
    nurse
  });
});

// Obtenir les heures travaillées par période
export const getWorkedHours = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { nurseId, period } = req.query; // period peut être 'month', 'year' ou 'all'

  // Validation des champs
  if (!nurseId || !period) {
    return next(new ErrorHandler('Tous les champs sont obligatoires', 400));
  }

  // Trouver l'infirmière
  const nurse = await Nurse.findOne({ _id: nurseId, hospital: hospitalId });
  if (!nurse) {
    return next(new ErrorHandler('Infirmière non trouvée', 404));
  }

  // Filtrer les gardes selon la période demandée
  let filteredShifts = [];
  const now = new Date();

  if (period === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredShifts = nurse.shifts.filter(shift => 
      shift.completed && shift.completedAt >= startOfMonth
    );
  } else if (period === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    filteredShifts = nurse.shifts.filter(shift => 
      shift.completed && shift.completedAt >= startOfYear
    );
  } else { // 'all'
    filteredShifts = nurse.shifts.filter(shift => shift.completed);
  }

  // Calculer le total des heures
  const hoursPerShift = 8; // Supposons 8 heures par garde
  const totalHours = filteredShifts.length * hoursPerShift;

  res.status(200).json({
    success: true,
    period,
    totalHours,
    shiftsCount: filteredShifts.length,
    nurse: {
      name: nurse.name,
      email: nurse.email
    }
  });
});

// Voir qui est de garde aujourd'hui
export const getOnDutyNurses = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Trouver toutes les infirmières avec des gardes aujourd'hui
  const nurses = await Nurse.find({
    hospital: hospitalId,
    'shifts.date': { $gte: today, $lt: tomorrow }
  });

  res.status(200).json({
    success: true,
    count: nurses.length,
    date: today.toISOString().split('T')[0],
    nurses: nurses.map(nurse => ({
      id: nurse._id,
      name: nurse.name,
      phone: nurse.phone,
      shifts: nurse.shifts.filter(shift => 
        shift.date >= today && shift.date < tomorrow
      )
    }))
  });
});

// Nouvelle méthode pour lister toutes les gardes
export const listAllShifts = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;

  // Trouve toutes les infirmières de l'hôpital avec leurs gardes
  const nurses = await Nurse.find({ hospital: hospitalId }).populate('shifts');

  // Extrait et formate les gardes
  const shifts = nurses.flatMap(nurse => 
    nurse.shifts.map(shift => ({
      id: shift._id,
      date: shift.date,
      shiftType: shift.shiftType,
      completed: shift.completed,
      nurse: {
        id: nurse._id,
        name: nurse.name,
        phone: nurse.phone
      }
    }))
  );

  res.status(200).json({
    success: true,
    shifts
  });
});