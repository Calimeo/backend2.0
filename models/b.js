// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  numeroPatient: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  telephone: String,
  email: String,
  adresse: {
    rue: String,
    ville: String,
    codePostal: String
  },
  assurance: {
    compagnie: String,
    numeroPolice: String,
    tauxCouverture: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);

// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  description: String,
  prix: {
    type: Number,
    required: true
  },
  categorie: {
    type: String,
    enum: ['consultation', 'hospitalisation', 'chirurgie', 'laboratoire', 'imagerie', 'pharmacie', 'autres'],
    required: true
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);

// models/Facture.js
const mongoose = require('mongoose');

const ligneFactureSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  quantite: {
    type: Number,
    default: 1,
    min: 1
  },
  prixUnitaire: {
    type: Number,
    required: true
  },
  remise: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  montantLigne: {
    type: Number,
    required: true
  }
});

const factureSchema = new mongoose.Schema({
  numeroFacture: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  dateFacture: {
    type: Date,
    default: Date.now
  },
  dateEcheance: {
    type: Date,
    required: true
  },
  lignes: [ligneFactureSchema],
  sousTotal: {
    type: Number,
    default: 0
  },
  remiseGlobale: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  montantRemise: {
    type: Number,
    default: 0
  },
  montantAvantTaxe: {
    type: Number,
    default: 0
  },
  tva: {
    type: Number,
    default: 0
  },
  montantTVA: {
    type: Number,
    default: 0
  },
  montantTotal: {
    type: Number,
    default: 0
  },
  montantAssurance: {
    type: Number,
    default: 0
  },
  montantPatient: {
    type: Number,
    default: 0
  },
  statut: {
    type: String,
    enum: ['brouillon', 'envoyee', 'payee', 'partiellement_payee', 'en_retard', 'annulee'],
    default: 'brouillon'
  },
  notes: String
}, {
  timestamps: true
});

// Middleware pour calculer les montants automatiquement
factureSchema.pre('save', function(next) {
  // Calculer le sous-total
  this.sousTotal = this.lignes.reduce((total, ligne) => total + ligne.montantLigne, 0);
  
  // Calculer la remise globale
  this.montantRemise = (this.sousTotal * this.remiseGlobale) / 100;
  
  // Montant avant taxe
  this.montantAvantTaxe = this.sousTotal - this.montantRemise;
  
  // Calculer la TVA
  this.montantTVA = (this.montantAvantTaxe * this.tva) / 100;
  
  // Montant total
  this.montantTotal = this.montantAvantTaxe + this.montantTVA;
  
  next();
});

// Méthode pour calculer la répartition assurance/patient
factureSchema.methods.calculerRepartition = function(tauxAssurance) {
  this.montantAssurance = (this.montantTotal * tauxAssurance) / 100;
  this.montantPatient = this.montantTotal - this.montantAssurance;
  return this.save();
};

module.exports = mongoose.model('Facture', factureSchema);

// models/Paiement.js
const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  numeroPaiement: {
    type: String,
    required: true,
    unique: true
  },
  facture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture',
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  datePaiement: {
    type: Date,
    default: Date.now
  },
  methodePaiement: {
    type: String,
    enum: ['especes', 'carte_bancaire', 'cheque', 'virement', 'assurance'],
    required: true
  },
  reference: String,
  notes: String,
  statut: {
    type: String,
    enum: ['en_attente', 'valide', 'rejete'],
    default: 'valide'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paiement', paiementSchema);

// controllers/factureController.js
const Facture = require('../models/Facture');
const Patient = require('./Patient');
const Service = require('./Service');
const Paiement = require('./Paiement');

class FactureController {
  // Créer une nouvelle facture
  async creerFacture(req, res) {
    try {
      const { patientId, lignes, remiseGlobale = 0, tva = 0, notes } = req.body;

      // Vérifier que le patient existe
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: 'Patient non trouvé' });
      }

      // Générer le numéro de facture
      const compteur = await Facture.countDocuments();
      const numeroFacture = `FACT-${new Date().getFullYear()}-${String(compteur + 1).padStart(6, '0')}`;

      // Calculer les lignes de facture
      const lignesCalculees = [];
      for (const ligne of lignes) {
        const service = await Service.findById(ligne.serviceId);
        if (!service) {
          return res.status(404).json({ error: `Service ${ligne.serviceId} non trouvé` });
        }

        const prixUnitaire = ligne.prixUnitaire || service.prix;
        const quantite = ligne.quantite || 1;
        const remise = ligne.remise || 0;
        const montantLigne = (prixUnitaire * quantite) * (1 - remise / 100);

        lignesCalculees.push({
          service: service._id,
          quantite,
          prixUnitaire,
          remise,
          montantLigne
        });
      }

      // Date d'échéance (30 jours par défaut)
      const dateEcheance = new Date();
      dateEcheance.setDate(dateEcheance.getDate() + 30);

      const nouvelleFacture = new Facture({
        numeroFacture,
        patient: patientId,
        dateEcheance,
        lignes: lignesCalculees,
        remiseGlobale,
        tva,
        notes
      });

      await nouvelleFacture.save();

      // Calculer la répartition si le patient a une assurance
      if (patient.assurance && patient.assurance.tauxCouverture > 0) {
        await nouvelleFacture.calculerRepartition(patient.assurance.tauxCouverture);
      }

      const factureComplete = await Facture.findById(nouvelleFacture._id)
        .populate('patient')
        .populate('lignes.service');

      res.status(201).json(factureComplete);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir toutes les factures avec pagination
  async obtenirFactures(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const statut = req.query.statut;
      const patientId = req.query.patientId;

      const filtres = {};
      if (statut) filtres.statut = statut;
      if (patientId) filtres.patient = patientId;

      const factures = await Facture.find(filtres)
        .populate('patient', 'nom prenom numeroPatient')
        .populate('lignes.service', 'nom code')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Facture.countDocuments(filtres);

      res.json({
        factures,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir une facture par ID
  async obtenirFacture(req, res) {
    try {
      const facture = await Facture.findById(req.params.id)
        .populate('patient')
        .populate('lignes.service');

      if (!facture) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      // Obtenir les paiements associés
      const paiements = await Paiement.find({ facture: facture._id });
      const montantPaye = paiements.reduce((total, paiement) => 
        paiement.statut === 'valide' ? total + paiement.montant : total, 0);

      res.json({
        ...facture.toObject(),
        paiements,
        montantPaye,
        montantRestant: facture.montantTotal - montantPaye
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Mettre à jour une facture
  async mettreAJourFacture(req, res) {
    try {
      const facture = await Facture.findById(req.params.id);
      if (!facture) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      // Vérifier que la facture peut être modifiée
      if (facture.statut === 'payee' || facture.statut === 'annulee') {
        return res.status(400).json({ error: 'Cette facture ne peut plus être modifiée' });
      }

      Object.assign(facture, req.body);
      await facture.save();

      const factureMAJ = await Facture.findById(facture._id)
        .populate('patient')
        .populate('lignes.service');

      res.json(factureMAJ);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Changer le statut d'une facture
  async changerStatut(req, res) {
    try {
      const { statut } = req.body;
      const facture = await Facture.findByIdAndUpdate(
        req.params.id,
        { statut },
        { new: true }
      ).populate('patient');

      if (!facture) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      res.json(facture);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Enregistrer un paiement
  async enregistrerPaiement(req, res) {
    try {
      const { factureId } = req.params;
      const { montant, methodePaiement, reference, notes } = req.body;

      const facture = await Facture.findById(factureId);
      if (!facture) {
        return res.status(404).json({ error: 'Facture non trouvée' });
      }

      // Vérifier les paiements existants
      const paiementsExistants = await Paiement.find({ facture: factureId, statut: 'valide' });
      const montantDejaPaye = paiementsExistants.reduce((total, p) => total + p.montant, 0);
      const montantRestant = facture.montantTotal - montantDejaPaye;

      if (montant > montantRestant) {
        return res.status(400).json({ error: 'Montant supérieur au solde restant' });
      }

      // Générer numéro de paiement
      const compteur = await Paiement.countDocuments();
      const numeroPaiement = `PAY-${new Date().getFullYear()}-${String(compteur + 1).padStart(6, '0')}`;

      const nouveauPaiement = new Paiement({
        numeroPaiement,
        facture: factureId,
        montant,
        methodePaiement,
        reference,
        notes
      });

      await nouveauPaiement.save();

      // Mettre à jour le statut de la facture
      const nouveauMontantPaye = montantDejaPaye + montant;
      let nouveauStatut = facture.statut;

      if (nouveauMontantPaye >= facture.montantTotal) {
        nouveauStatut = 'payee';
      } else if (nouveauMontantPaye > 0) {
        nouveauStatut = 'partiellement_payee';
      }

      await Facture.findByIdAndUpdate(factureId, { statut: nouveauStatut });

      res.status(201).json(nouveauPaiement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obtenir le tableau de bord financier
  async obtenirTableauBord(req, res) {
    try {
      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      
      // Statistiques générales
      const stats = await Promise.all([
        // Factures du mois
        Facture.aggregate([
          { $match: { dateFacture: { $gte: debutMois } } },
          { $group: { _id: null, total: { $sum: '$montantTotal' }, count: { $sum: 1 } } }
        ]),
        
        // Paiements du mois
        Paiement.aggregate([
          { $match: { datePaiement: { $gte: debutMois }, statut: 'valide' } },
          { $group: { _id: null, total: { $sum: '$montant' }, count: { $sum: 1 } } }
        ]),
        
        // Factures en retard
        Facture.countDocuments({ 
          dateEcheance: { $lt: maintenant },
          statut: { $nin: ['payee', 'annulee'] }
        }),
        
        // Factures par statut
        Facture.aggregate([
          { $group: { _id: '$statut', count: { $sum: 1 }, total: { $sum: '$montantTotal' } } }
        ])
      ]);

      const facturesMois = stats[0][0] || { total: 0, count: 0 };
      const paiementsMois = stats[1][0] || { total: 0, count: 0 };
      const facturesRetard = stats[2];
      const facturesParStatut = stats[3];

      res.json({
        moisCourant: {
          facturation: facturesMois,
          paiements: paiementsMois,
          facturesEnRetard: facturesRetard
        },
        repartitionStatuts: facturesParStatut
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FactureController();

// routes/factureRoutes.js
const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');

// Routes pour les factures
router.post('/', factureController.creerFacture);
router.get('/', factureController.obtenirFactures);
router.get('/tableau-bord', factureController.obtenirTableauBord);
router.get('/:id', factureController.obtenirFacture);
router.put('/:id', factureController.mettreAJourFacture);
router.patch('/:id/statut', factureController.changerStatut);

// Routes pour les paiements
router.post('/:factureId/paiements', factureController.enregistrerPaiement);

module.exports = router;

// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const Service = require('./Service');

// Obtenir tous les services
router.get('/', async (req, res) => {
  try {
    const { categorie, actif } = req.query;
    const filtres = {};
    
    if (categorie) filtres.categorie = categorie;
    if (actif !== undefined) filtres.actif = actif === 'true';
    
    const services = await Service.find(filtres).sort({ nom: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouveau service
router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour un service
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const factureRoutes = require('./routes/factureRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/hopital_facturation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/factures', factureRoutes);
app.use('/api/services', serviceRoutes);

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de facturation hospitalière fonctionnelle' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;