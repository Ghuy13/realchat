import express from "express";
import { sendDirectMessage, sendDGroupMessage } from "../controller/messageController.js";
import { checkFriendship, checkGroupMembership } from "../middlewares/friendMiddlewares.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendDGroupMessage);

export default router;