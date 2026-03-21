import express from "express";
import { authMe, searchUserByUsername, uploadAvatar, } from "../controller/userController.js";
import { upload } from "../middlewares/uploadMidlewares.js";


const router = express.Router();

router.get("/me", authMe);
router.get("/search", searchUserByUsername)
router.post("/uploadAvatar", upload.single("file", uploadAvatar))

export default router;