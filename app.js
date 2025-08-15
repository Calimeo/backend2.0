import express from "express";
import {config} from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import {errorMiddleware} from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import AppointmentRouter from "./router/appointmentRouter.js";
import hopitalRoutes from './router/hopital.routes.js';
// import serviceRoutes from './router/services.routes.js';
import medecinRoutes from './router/medecin.routes.js';
import chambreRoutes from './router/chambre.routes.js';
import litRoutes from './router/lit.routes.js';
import admissionRoutes from './router/admission.routes.js';
import fournitureRoutes from './router/stock.routes.js';
import patientRoutes from './router/patient.routes.js';
import ordonnanceRoutes from './router/ordonnance.routes.js';
import paiementRoutes from './router/paiement.routes.js';
import messageRoutes from './router/message.routes.js';
import roleRoutes from './router/role.routes.js';
// import securiteRoutes from './router/securite.routes.js';
import statistiquesRoutes from './router/statistiques.routes.js';
import parametresRoutes from './router/parametre.routes.js';
import notificationRoutes from './router/notification.routes.js';
import stockRoutes from './router/stock.routes.js';
import hospitalDoctorRoute from "./router/doctor.routes.js";
import serviceRoute from "./router/service.routes.js";
// import apppoitmentallRoute from "./router/appoitmentall.routes.js";
import nurseRoute from "./router/nurse.routes.js";
import pharmacyRoute from "./router/pharmacy.routes.js";
import purchaseRoute from "./router/purchase.routes.js";
import accountingRoute from "./router/accounting.router.js";
import availabilityRoute from "./router/availability.routes.js";
import bloodStockRoute from "./router/bloodStock.routes.js";
import deathRoute from "./router/death.routes.js";
import hospitalDashboardRoutes from "./router/dashboard.routes.js";
import birthRoute from "./router/birth.routes.js";
import prescriptionRoute from "./router/prescription.routes.js";

const app = express()

config({path:"./config/config.env"})
app.use(
    cors({
      origin:[process.env.FRONTEND_URL,process.env.DASHBOARD_URL,process.env.DASHBOARDHOPITAL_URL,process.env.DASHBOARDDOCTOR_URL],
      methods:["GET", "POST", "PUT", "DELETE","PATCH"],
      credentials: true,


    })
);
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir: "/tmp/",
})
);

app.get("/", (req, res) => {
  res.send("API is running 🟢");
});


app.use("/api/v1/user", userRouter);
app.use("/api/v1/appoitment", AppointmentRouter);

app.use('/api/hopitaux', hopitalRoutes);
// app.use('/api/services', serviceRoutes);
app.use('/api/medecins', medecinRoutes);
app.use('/api/', chambreRoutes);
app.use('/api/lits', litRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/fournitures', fournitureRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/ordonnances', ordonnanceRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/v1', messageRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/v1/inventory', stockRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/v1/doctors", hospitalDoctorRoute);
app.use("/api/v1/service", serviceRoute);
// app.use("/api/v1/rvz", apppoitmentallRoute);
app.use("/api/v1/nurse", nurseRoute);
app.use("/api/v1", pharmacyRoute);
app.use("/api/v1", purchaseRoute);
app.use("/api/v1/accounting", accountingRoute);
app.use("/api/v1/availability", availabilityRoute);
app.use("/api/v1/blood", bloodStockRoute);
app.use("/api/v1/death", deathRoute);
app.use("/api/v1/dashboard", hospitalDashboardRoutes);
app.use("/api/v1/birth", birthRoute);
app.use("/api/v1/prescription", prescriptionRoute);


dbConnection();

app.use(errorMiddleware);
export default app;