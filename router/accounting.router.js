import express from "express";
import { getAllTransactions, createTransaction } from "../controller/accounting.controller.js";

const router = express.Router();

router.get("/", getAllTransactions);
router.post("/", createTransaction);

export default router;
