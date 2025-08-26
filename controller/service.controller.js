import Service from "../models/service.js";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Créer un nouveau service
export const createService = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    price,
    duration,
    category,
    requirements,
    notes
  } = req.body;

  const hospitalId = req.user._id;

  // Vérifier que l'utilisateur est un hôpital
  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Vérifier si le service existe déjà pour cet hôpital
  const existingService = await Service.findOne({
    name,
    hospital: hospitalId
  });

  if (existingService) {
    return next(new ErrorHandler('Un service avec ce nom existe déjà pour cet hôpital.', 400));
  }

  // Créer le service
  const service = await Service.create({
    name,
    description,
    price,
    duration,
    category,
    requirements,
    notes,
    hospital: hospitalId,
    createdBy: req.user._id
  });

  const populatedService = await Service.findById(service._id)
    .populate("hospital", "name address phone")
    .populate("createdBy", "firstName lastName");

  res.status(201).json({
    success: true,
    message: 'Service créé avec succès',
    data: populatedService
  });
});

// Obtenir tous les services d'un hôpital
export const getHospitalServices = catchAsyncErrors(async (req, res, next) => {
  const { hospitalId } = req.params;
  const { category } = req.query;

  // Vérifier que l'hôpital existe
  const hospital = await User.findOne({
    _id: hospitalId,
    role: "Hospital"
  });

  if (!hospital) {
    return next(new ErrorHandler('Hôpital non trouvé', 404));
  }

  let services;
  if (category) {
    services = await Service.getServicesByCategory(hospitalId, category);
  } else {
    services = await Service.getHospitalServices(hospitalId);
  }

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// Obtenir tous les services disponibles (pour les patients)
export const getAllServices = catchAsyncErrors(async (req, res, next) => {
  const { category, hospitalId, search } = req.query;

  let filter = { 
    availability: { $in: ["available", "limited"] } 
  };

  if (category) {
    filter.category = category;
  }

  if (hospitalId) {
    filter.hospital = hospitalId;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const services = await Service.find(filter)
    .populate("hospital", "name address phone email")
    .populate("doctors", "firstName lastName specialty")
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// Obtenir un service spécifique
export const getService = catchAsyncErrors(async (req, res, next) => {
  const { serviceId } = req.params;

  const service = await Service.findById(serviceId)
    .populate("hospital", "name address phone email")
    .populate("doctors", "firstName lastName specialty experience")
    .populate("createdBy", "firstName lastName");

  if (!service) {
    return next(new ErrorHandler('Service non trouvé', 404));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// Mettre à jour un service
export const updateService = catchAsyncErrors(async (req, res, next) => {
  const { serviceId } = req.params;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const service = await Service.findOne({
    _id: serviceId,
    hospital: hospitalId
  });

  if (!service) {
    return next(new ErrorHandler('Service non trouvé', 404));
  }

  // Mettre à jour les champs
  const allowedUpdates = ['name', 'description', 'price', 'duration', 'category', 'requirements', 'notes', 'availability'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      service[field] = req.body[field];
    }
  });

  await service.save();

  const updatedService = await Service.findById(serviceId)
    .populate("hospital", "name address phone")
    .populate("doctors", "firstName lastName specialty")
    .populate("createdBy", "firstName lastName");

  res.status(200).json({
    success: true,
    message: 'Service mis à jour avec succès',
    data: updatedService
  });
});

// Supprimer un service
export const deleteService = catchAsyncErrors(async (req, res, next) => {
  const { serviceId } = req.params;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const service = await Service.findOne({
    _id: serviceId,
    hospital: hospitalId
  });

  if (!service) {
    return next(new ErrorHandler('Service non trouvé', 404));
  }

  await Service.findByIdAndDelete(serviceId);

  res.status(200).json({
    success: true,
    message: 'Service supprimé avec succès'
  });
});

// Ajouter un docteur à un service
export const addDoctorToService = catchAsyncErrors(async (req, res, next) => {
  const { serviceId, doctorId } = req.body;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Vérifier le service
  const service = await Service.findOne({
    _id: serviceId,
    hospital: hospitalId
  });

  if (!service) {
    return next(new ErrorHandler('Service non trouvé', 404));
  }

  // Vérifier le docteur
  const doctor = await User.findOne({
    _id: doctorId,
    role: "Doctor",
    hospitalId: hospitalId
  });

  if (!doctor) {
    return next(new ErrorHandler('Docteur non trouvé ou n\'appartient pas à cet hôpital', 404));
  }

  // Vérifier si le docteur est déjà dans le service
  if (service.doctors.includes(doctorId)) {
    return next(new ErrorHandler('Le docteur est déjà dans ce service', 400));
  }

  service.doctors.push(doctorId);
  await service.save();

  const updatedService = await Service.findById(serviceId)
    .populate("hospital", "name address phone")
    .populate("doctors", "firstName lastName specialty")
    .populate("createdBy", "firstName lastName");

  res.status(200).json({
    success: true,
    message: 'Docteur ajouté au service avec succès',
    data: updatedService
  });
});

// Retirer un docteur d'un service
export const removeDoctorFromService = catchAsyncErrors(async (req, res, next) => {
  const { serviceId, doctorId } = req.body;
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const service = await Service.findOne({
    _id: serviceId,
    hospital: hospitalId
  });

  if (!service) {
    return next(new ErrorHandler('Service non trouvé', 404));
  }

  service.doctors = service.doctors.filter(doc => doc.toString() !== doctorId);
  await service.save();

  const updatedService = await Service.findById(serviceId)
    .populate("hospital", "name address phone")
    .populate("doctors", "firstName lastName specialty")
    .populate("createdBy", "firstName lastName");

  res.status(200).json({
    success: true,
    message: 'Docteur retiré du service avec succès',
    data: updatedService
  });
});

// Obtenir les statistiques des services
export const getServiceStats = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;

  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const stats = await Service.aggregate([
    { $match: { hospital: hospitalId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalPrice: { $sum: '$price' },
        available: {
          $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] }
        },
        unavailable: {
          $sum: { $cond: [{ $eq: ['$availability', 'unavailable'] }, 1, 0] }
        },
        limited: {
          $sum: { $cond: [{ $eq: ['$availability', 'limited'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const totalServices = await Service.countDocuments({ hospital: hospitalId });

  res.status(200).json({
    success: true,
    data: {
      totalServices,
      byCategory: stats
    }
  });
});