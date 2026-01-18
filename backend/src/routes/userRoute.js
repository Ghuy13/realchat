import express from "express";
import { authMe } from "../controller/userController.js";

const router = express.Router();

router.get("/me", authMe);

export default router;