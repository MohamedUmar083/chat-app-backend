import Chat from "../Model/chatSchema.js";
import bcrypt from "bcryptjs";
import User from "../Model/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

export const accessChat = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userID } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userID],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res
        .status(200)
        .json({ message: "Chat Created Successfully", data: FullChat });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error Creating Chat" });
    }
  }
};

export const fetchChat = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username avatar email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Chat" });
  }
};

export const createGroup = async (req, res) => {
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res
      .status(200)
      .json({ message: "Group Created Successfully", data: fullGroupChat });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Creating Group Chat" });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(200)
      .json({ message: "Group Name updated successfully", data: updatedChat });
    if (!updatedChat) {
      return res.status(404).json({ message: "Group Chat not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Renaming Group Chat" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(200)
      .json({ message: "Member added successfully", data: updatedChat });
    if (!updatedChat) {
      return res.status(404).json({ message: "Group Chat not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Adding Member to Group Chat" });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(200)
      .json({ message: "Member removed successfully", data: updatedChat });
    if (!updatedChat) {
      return res.status(404).json({ message: "Group Chat not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Removing Member from Group Chat" });
  }
};
