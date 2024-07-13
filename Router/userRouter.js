import express from "express";
import {
  allUser,
  loginUser,
  registerUser,
} from "../Controllers/userController.js";
import authMiddleware from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
router.get("/get-user", authMiddleware, allUser);
// router.post("/forget-password", forgetPassword);
// router.post("/reset-password/:id", resetPassword);

export default router;
