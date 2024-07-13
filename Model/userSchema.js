import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: "String", unique: true },
    password: String,
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    token: String,
  },
  { timestaps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
