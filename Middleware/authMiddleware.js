import jwt from "jsonwebtoken";
import User from "../Model/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Token not Found" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.user = decode;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Access denied Not a Valid User" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Invalid Token Internal Server Error" });
  }
};

export default authMiddleware;
