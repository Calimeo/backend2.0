import { Inventory } from "../models/inventory.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import cloudinary from "cloudinary";

// ➕ Ajouter un item (associé automatiquement à l'hôpital)
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
    hospital: req.user._id, // Association automatique à l'hôpital
  });

  res.status(201).json({
    success: true,
    message: "Item ajouté avec succès",
    item: newItem,
  });
});

// 📄 Obtenir tous les items de l'hôpital connecté
export const getInventory = catchAsyncErrors(async (req, res) => {
  const items = await Inventory.find({ hospital: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, items });
});

// ✏️ Mettre à jour un item (avec vérification de permission)
export const updateInventory = catchAsyncErrors(async (req, res, next) => {
  const item = await Inventory.findOne({ 
    _id: req.params.id, 
    hospital: req.user._id 
  });
  
  if (!item) return next(new ErrorHandler("Item introuvable ou non autorisé", 404));

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

// ❌ Supprimer un item (avec vérification de permission)
export const deleteInventory = catchAsyncErrors(async (req, res, next) => {
  const item = await Inventory.findOne({ 
    _id: req.params.id, 
    hospital: req.user._id 
  });
  
  if (!item) return next(new ErrorHandler("Item introuvable ou non autorisé", 404));

  if (item.image?.public_id) {
    await cloudinary.v2.uploader.destroy(item.image.public_id);
  }

  await item.deleteOne();

  res.status(200).json({ success: true, message: "Item supprimé avec succès" });
});

// 🔍 Obtenir un item spécifique (avec vérification de permission)
export const getInventoryItem = catchAsyncErrors(async (req, res, next) => {
  const item = await Inventory.findOne({ 
    _id: req.params.id, 
    hospital: req.user._id 
  });
  
  if (!item) return next(new ErrorHandler("Item introuvable ou non autorisé", 404));

  res.status(200).json({ success: true, item });
});

// 📊 Statistiques de l'inventaire de l'hôpital
export const getInventoryStats = catchAsyncErrors(async (req, res) => {
  const stats = await Inventory.aggregate([
    { $match: { hospital: req.user._id } },
    {
      $group: {
        _id: "$type",
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        lowStock: {
          $sum: {
            $cond: [{ $lte: ["$quantity", 10] }, 1, 0]
          }
        }
      }
    }
  ]);

  const totalItems = await Inventory.countDocuments({ hospital: req.user._id });
  const totalValue = await Inventory.aggregate([
    { $match: { hospital: req.user._id } },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ["$quantity", "$unitPrice"] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    stats,
    totalItems,
    totalValue: totalValue[0]?.total || 0
  });
});

// ⚠️ Obtenir les items en rupture de stock
export const getLowStockItems = catchAsyncErrors(async (req, res) => {
  const lowStockItems = await Inventory.find({
    hospital: req.user._id,
    quantity: { $lte: 10 } // Seuil de stock faible
  }).sort({ quantity: 1 });

  res.status(200).json({ success: true, items: lowStockItems });
});

// 🔄 Mettre à jour la quantité en stock
export const updateStockQuantity = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, action } = req.body; // action: 'add', 'remove', 'set'

  const item = await Inventory.findOne({ 
    _id: id, 
    hospital: req.user._id 
  });
  
  if (!item) return next(new ErrorHandler("Item introuvable ou non autorisé", 404));

  if (action === 'add') {
    item.quantity += quantity;
  } else if (action === 'remove') {
    item.quantity = Math.max(0, item.quantity - quantity);
  } else if (action === 'set') {
    item.quantity = quantity;
  } else {
    return next(new ErrorHandler("Action non valide", 400));
  }

  await item.save();

  res.status(200).json({
    success: true,
    message: "Stock mis à jour avec succès",
    item
  });
});