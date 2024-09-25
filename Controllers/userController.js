import User from "../Model/userSchema.js";
import jwt from "jsonwebtoken";
import dontenv from "dotenv";
import bcrypt from "bcryptjs";

dontenv.config();

export const registerUser = async (req, res) => {
  try {
    const { username, email, confirmpassword } = req.body;
    const emailExists = await User.findOne({ email });
    const userExists = await User.findOne({ username });

    if (emailExists) {
      return res.status(400).json({ message: "Email Already Exists" });
    }

    if (userExists) {
      return res.status(400).json({ message: "Username Already Taken" });
    }

    const hash = await bcrypt.hash(confirmpassword, 10);

    const newUser = await User({ username, email, password: hash });

    await newUser.save();
    res.status(200).json({
      message: "User Registered Successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Registeration Failed Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const pasMatch = await bcrypt.compare(password, user.password);
    if (!pasMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: "30d",
    });
    user.token = token;
    await user.save();

    res.status(200).json({ message: "Logged in Successfully", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login Failed Internal Server Error" });
  }
};

export const allUser = async (req, res) => {
  try {
    const userID = req.user._id;
    const authuser = await User.findById(userID);
    //res.status(200).json({ message: "Authorised User", data: [authuser] });
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({
      _id: { $ne: authuser._id },
    });
    res.status(200).send(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error Failed to Fetch User" });
  }
};

// export const forgetPassword = async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(401).json({ Message: "User Not Found" });
//   }
//   const { success, error } = await sendPasswordResetEmail(user.email, user._id);

//   if (success) {
//     res.status(200).json({ Message: "Password reset email sent" });
//   } else {
//     res.status(500).json({ Message: "Error sending email", error });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const userid = req.params.id;
//     const { newpassword, confirmpassword } = req.body;
//     if (newpassword !== confirmpassword) {
//       return res.status(401).json({ Message: "Pasword Doesn't Match" });
//     }
//     const hash = await bcrypt.hash(confirmpassword, 10);
//     await User.findByIdAndUpdate({ _id: userid }, { password: hash });
//     res.status(200).json({ Message: "Pasword Reset Successfully" });
//   } catch (error) {
//     res.status(500).json({ Message: "Internal Server Error" });
//   }
// };
