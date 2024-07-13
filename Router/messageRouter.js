import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import { allMessage, sendMessage } from "../Controllers/messageController.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, allMessage);

export default router;
