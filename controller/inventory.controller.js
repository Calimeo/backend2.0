import { Inventory } from "../models/inventory.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";

// ➕ Ajouter un item
export const addInventory = catchAsyncErrors(async (req, res, next) => {
  const { name, type, subtype, description, quantity, unit, expirationDate } = req.body;

  if (!name || !type || !quantity || !unit) {
    return next(new ErrorHandler("Tous les champs obligatoires ne sont pas fournis", 400));
  }

  let image = {};

  if (req.files && req.files.image) {
    const result = await cloudinary.v2.uploader.upload(req.files.image.tempFilePath, {
      folder: "hospital_inventory",
    });

    image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const newItem = await Inventory.create({
    name,
    type,
    subtype: type === "medicine" ? subtype : undefined,
    description,
    quantity,
    unit,
    expirationDate,
    image,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Item ajouté avec succès",
    item: newItem,
  });
});

// 📄 Obtenir tous les items
export const getInventory = catchAsyncErrors(async (req, res) => {
  const items = await Inventory.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, items });
});

// ✏️ Mettre à jour un item
export const updateInventory = catchAsyncErrors(async (req, res, next) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return next(new ErrorHandler("Item introuvable", 404));

  const { name, type, subtype, description, quantity, unit, expirationDate } = req.body;

  item.name = name || item.name;
  item.type = type || item.type;
  item.subtype = type === "medicine" ? subtype || item.subtype : undefined;
  item.description = description || item.description;
  item.quantity = quantity !== undefined ? quantity : item.quantity;
  item.unit = unit || item.unit;
  item.expirationDate = expirationDate || item.expirationDate;

  if (req.files && req.files.image) {
    if (item.image?.public_id) {
      await cloudinary.v2.uploader.destroy(item.image.public_id);
    }

    const result = await cloudinary.v2.uploader.upload(req.files.image.tempFilePath, {
      folder: "hospital_inventory",
    });

    item.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await item.save();

  res.status(200).json({
    success: true,
    message: "Item mis à jour avec succès",
    item,
  });
});

// ❌ Supprimer un item
export const deleteInventory = catchAsyncErrors(async (req, res, next) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return next(new ErrorHandler("Item introuvable", 404));

  if (item.image?.public_id) {
    await cloudinary.v2.uploader.destroy(item.image.public_id);
  }

  await item.deleteOne();

  res.status(200).json({ success: true, message: "Item supprimé avec succès" });
});
