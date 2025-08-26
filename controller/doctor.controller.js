import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";

// Ajouter un médecin lié à un hôpital
export const addDoctorToHospital = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    confirmPassword,
    doctorDepartment,
  } = req.body;

  // Validation des champs obligatoires
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !confirmPassword ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Veuillez remplir tous les champs obligatoires!", 400));
  }

  // Vérification de la correspondance des mots de passe
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Les mots de passe ne correspondent pas!", 400));
  }

  // Vérification de l'existence de l'email
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Un médecin avec cet email existe déjà!", 400));
  }

  // Validation de l'avatar
  if (!req.files?.docAvatar) {
    return next(new ErrorHandler("L'avatar du médecin est requis!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("Format d'image non supporté!", 400));
  }

  // Upload vers Cloudinary
  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath, {
      folder: 'hospital/doctors',
      width: 500,
      height: 500,
      crop: 'fill',
      quality: 'auto'
    });
  } catch (error) {
    console.error("Erreur Cloudinary:", error);
    return next(new ErrorHandler("Échec de l'upload de l'avatar", 500));
  }

  // Création du médecin
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    confirmPassword,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
    hospitalId: req.user._id // Ajout de l'hôpital associé
  });

  // Réponse sans le mot de passe
  const doctorData = doctor.toObject();
  delete doctorData.password;
  delete doctorData.confirmPassword;

  res.status(201).json({
    success: true,
    message: "Nouveau médecin enregistré avec succès",
    doctor: doctorData
  });
});

export const getDoctorsByHospital = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id; // L'hôpital connecté via token

  // Vérifie que l'utilisateur est bien un hôpital
  if (req.user.role !== "Hospital") {
    return next(new ErrorHandler("Accès refusé. Réservé aux hôpitaux.", 403));
  }

  const doctors = await User.find({
    role: "Doctor",
    hospitalId: hospitalId,
  }).select("-password"); // on ne renvoie pas le mot de passe

  res.status(200).json({
    success: true,
    doctors,
  });
});


// Mettre à jour le statut d'un médecin
export const updateDoctorStatus = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.params;
  const { status } = req.body;
  const hospitalId = req.user._id;

  console.log("Hospital ID:", hospitalId);
  console.log("Doctor ID:", doctorId);
  console.log("New status:", status);

  // Vérifier que l'utilisateur est un hôpital
  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  // Valider le statut
  const validStatuses = ['present', 'absent', 'on_break'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Statut invalide. Options: present, absent, on_break', 400));
  }

  try {
    // Trouver et mettre à jour le médecin dans User
    const doctor = await User.findOneAndUpdate(
      { 
        _id: doctorId,
        role: 'Doctor', // S'assurer que c'est un docteur
        hospitalId: hospitalId // S'assurer que le docteur appartient à l'hôpital
      },
      { status },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!doctor) {
      console.log("Docteur non trouvé avec ces critères:");
      console.log("- ID:", doctorId);
      console.log("- Role: Doctor");
      console.log("- Hospital ID:", hospitalId);
      
      return next(new ErrorHandler('Médecin non trouvé ou non autorisé', 404));
    }

    console.log("Docteur mis à jour:", doctor);

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      doctor
    });

  } catch (error) {
    console.error("Erreur détaillée:", error);
    return next(new ErrorHandler('Erreur serveur', 500));
  }
});

// Obtenir tous les médecins d'un hôpital avec leurs statuts
export const getHospitalDoctors = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;

  // Vérifier que l'utilisateur est un hôpital
  if (req.user.role !== 'Hospital') {
    return next(new ErrorHandler('Accès refusé. Réservé aux hôpitaux.', 403));
  }

  const doctors = await Doctor.find({ 
    hospitalId: hospitalId,
    role: 'Doctor'
  }).select('-password');

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors
  });
});