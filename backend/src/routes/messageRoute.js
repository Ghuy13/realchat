import express from "express";
import { sendDirectMessage, sendDGroupMessage } from "../controller/messageController.js";
import { checkFriendship, checkGroupMembership } from "../middlewares/friendMiddlewares.js";
import { uploadMessageImage } from "../middlewares/uploadMidlewares.js";

const router = express.Router();

router.post("/direct", uploadMessageImage.single('image'), checkFriendship, sendDirectMessage);
router.post("/group", uploadMessageImage.single('image'), checkGroupMembership, sendDGroupMessage);

export default router;