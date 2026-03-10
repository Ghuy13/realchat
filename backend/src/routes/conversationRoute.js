import express from "express";
import { createConversation, getConversations, getMessages } from "../controller/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddlewares.js";

const router = express.Router();

router.post("/", checkFriendship, createConversation);
router.get("/", getConversations);
router.get("/:conversationId/messages", getMessages);

export default router;
