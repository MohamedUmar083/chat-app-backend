import express from "express";
import authMiddleware from "../Middleware/authMiddleware.js";
import {
  accessChat,
  addMember,
  createGroup,
  fetchChat,
  removeMember,
  renameGroup,
} from "../Controllers/chatController.js";
const router = express.Router();

router.post("/accesschat", authMiddleware, accessChat);
router.get("/fetchchat", authMiddleware, fetchChat);
router.post("/group", authMiddleware, createGroup);
router.put("/rename", authMiddleware, renameGroup);
router.put("/addmember", authMiddleware, addMember);
router.put("/removemember", authMiddleware, removeMember);

export default router;
