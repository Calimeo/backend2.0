// controllers/pharmacyController.js
import { Product } from "../models/products.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js"
import { v2 as cloudinary } from 'cloudinary';


export const addProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, description, price, stock, category, expiryDate } = req.body;
  const hospitalId = req.user._id;

  // Validation des champs obligatoires
  if (!name || !price || !stock || !category) {
    return next(new ErrorHandler('Veuillez remplir tous les champs obligatoires', 400));
  }

  if (isNaN(price) || price <= 0) {
    return next(new ErrorHandler('Le prix doit être un nombre positif', 400));
  }

  if (isNaN(stock) || stock < 0) {
    return next(new ErrorHandler('Le stock doit être un nombre positif ou nul', 400));
  }

  // Gestion de l'image
  let image = {};
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'pharmacy/products',
        width: 500,
        height: 500,
        crop: 'fill'
      });

      image = {
        public_id: result.public_id,
        url: result.secure_url
      };
    } catch (error) {
      return next(new ErrorHandler("Erreur lors de l'upload de l'image", 500));
    }
  }

  // Création du produit
  const product = await Product.create({
    hospital: hospitalId,
    name,
    description,
    price,
    stock,
    image,
    category,
    expiryDate: expiryDate || null
  });

  res.status(201).json({
    success: true,
    message: 'Produit ajouté avec succès',
    product
  });
});

// Voir tous les produits d’un hôpital
export const listProducts = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.user._id;
  const { category, search } = req.query;

  // Construction de la requête
  const query = { hospital: hospitalId };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});



export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const productId = req.params.id;
  const hospitalId = req.user._id;

  const product = await Product.findOne({
    _id: productId,
    hospital: hospitalId
  });

  if (!product) {
    return next(new ErrorHandler('Produit non trouvé', 404));
  }

  // Suppression de l'image sur Cloudinary si elle existe
  if (product.image?.public_id) {
    await cloudinary.uploader.destroy(product.image.public_id);
  }

  await Product.deleteOne({ _id: productId });

  res.status(200).json({
    success: true,
    message: 'Produit supprimé avec succès'
  });
});
