// controllers/purchaseController.js
import { Product } from "../models/products.js";
import { Purchase } from "../models/Purchase.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

// Voir tous les produits disponibles
export const getAvailableProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find({ stock: { $gt: 0 } });

  res.status(200).json({
    success: true,
    products,
  });
});

// Acheter un produit
export const buyProduct = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return next(new ErrorHandler("Product ID and quantity are required", 400));
  }

  const product = await Product.findById(productId);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  if (product.stock < quantity)
    return next(new ErrorHandler("Not enough stock", 400));

  const totalPrice = product.price * quantity;

  // Mettre à jour le stock
  product.stock -= quantity;
  await product.save();

  const purchase = await Purchase.create({
    patient: req.user._id,
    product: productId,
    quantity,
    totalPrice,
  });

  res.status(201).json({
    success: true,
    message: "Purchase successful",
    purchase,
  });
});

// Historique des achats du patient
export const getMyPurchases = catchAsyncErrors(async (req, res, next) => {
  const purchases = await Purchase.find({ patient: req.user._id }).populate("product");

  res.status(200).json({
    success: true,
    purchases,
  });
});
