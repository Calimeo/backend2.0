import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password,confirmPassword } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !confirmPassword
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }
   if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    confirmPassword,
    role: "Patient",
  });
  generateToken(user, "User Registered!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`User Not Found With This Role!`, 400));
  }
  generateToken(user, "Login Successfully!", 201, res);
});


export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

export const addNewHospital = catchAsyncErrors(async (req, res, next) => {
  const { name, directeur,adresse,email, phone, password } =
    req.body;
  if (
    !name ||
    !email ||
    !phone ||
    !adresse ||
    !directeur ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("hospital With This Email Already Exists!", 400));
  }

  const hospital = await User.create({
    name,
    email,
    phone,
    adresse,
    directeur,
    password,
    role: "Hospital",
  });
  res.status(200).json({
    success: true,
    message: "New hospital Registered",
    hospital,
  });
});
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment ||
    !docAvatar
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
    );
  }
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

// Exemple de contrôleur à ajouter dans userController.js
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" }).select("firstName lastName email docAvatar");

  res.status(200).json({
    success: true,
    users: doctors, // 👈 DOIT retourner `users` pour correspondre au frontend
  });
});


export const getAllPatients = catchAsyncErrors(async (req, res, next) => {
  const patients = await User.find({ role: "Patient" });
  res.status(200).json({
    success: true,
    patients,
  });
});
export const getAllHospitals = catchAsyncErrors(async (req, res, next) => {
  const Hospitals = await User.find({ role: "Hospital" });
  res.status(200).json({
    success: true,
    Hospitals,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
});

// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully.",
    });
});

export const logoutHospital = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("hospitalToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "hospital Logged Out Successfully.",
    });
});

export const logoutDoctor = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("doctorToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "doctor Logged Out Successfully.",
    });
});


export const searchDoctors = catchAsyncErrors(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new ErrorHandler("Champ de recherche vide", 400));
  }

  const regex = new RegExp(query, "i"); // insensible à la casse

  const doctors = await User.find({
    role: "Doctor",
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
      { doctorDepartment: regex }
    ],
  }).select("-password"); // on exclut le mot de passe

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});

// Suivre un médecin
export const followDoctor = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id;
  const { doctorId } = req.params;

  if (patientId.toString() === doctorId) {
    return next(new ErrorHandler("Vous ne pouvez pas vous suivre vous-même", 400));
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Médecin introuvable", 404));
  }

  const patient = await User.findById(patientId);

  if (patient.following.includes(doctorId)) {
    return next(new ErrorHandler("Déjà suivi", 400));
  }

  patient.following.push(doctorId);
  doctor.followers.push(patientId);

  await patient.save();
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Médecin suivi avec succès",
  });
});

//  Se désabonner
export const unfollowDoctor = catchAsyncErrors(async (req, res, next) => {
  const patientId = req.user._id;
  const { doctorId } = req.params;

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Médecin introuvable", 404));
  }

  const patient = await User.findById(patientId);

  patient.following = patient.following.filter(id => id.toString() !== doctorId);
  doctor.followers = doctor.followers.filter(id => id.toString() !== patientId.toString());

  await patient.save();
  await doctor.save();

  res.status(200).json({
    success: true,
    message: "Désabonné du médecin avec succès",
  });
});

// Obtenir les médecins suivis
export const getFollowedDoctors = catchAsyncErrors(async (req, res, next) => {
  const patient = await User.findById(req.user._id).populate("following");

  res.status(200).json({
    success: true,
    doctors: patient.following,
  });
});

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password");
    if (!doctor || doctor.role !== "Doctor") {
      return res.status(404).json({ message: "Médecin introuvable" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Erreur lors de la récupération du médecin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};