// controllers/pharmacyController.js
import { Product } from "../models/products.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Ajouter un produit
export const addProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, price, stock, category, expiryDate } = req.body;

  if (!name || !price || !stock || !category) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const product = await Product.create({
    hospital: req.user._id,
    name,
    description,
    price,
    stock,
    category,
    expiryDate,
  });

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    product,
  });
});

// Voir tous les produits d’un hôpital
export const getHospitalProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ hospital: req.user._id });

  res.status(200).json({
    success: true,
    products,
  });
});
