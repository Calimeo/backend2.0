import express from "express";
import { getAllTransactions, createTransaction, addAccountingEntry, getMyAccountingEntries } from "../controller/accounting.controller.js";

import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js";
const router = express.Router();

router.get("/", getAllTransactions);
router.post("/", createTransaction);
router.post("/add", isAuthenticated, addAccountingEntry);
router.get("/my-entries", isAuthenticated, getMyAccountingEntries);

export default router;
