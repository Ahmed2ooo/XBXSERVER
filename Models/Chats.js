const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: false, // النص اختياري إذا كان هناك ملف
  },
  file: {
    type: String, // هذا الحقل سيخزن رابط الملف المرفوع
    required: false,
  },
  received: {
    type: Boolean,
    default: false,
  },
  
  seen: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new mongoose.Schema({
  senderUserName: {
    type: String,
    required: true,
  },
  messages: [MessageSchema], // قائمة الرسائل لكل جلسة دردشة
});

const UserChatsSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  chats: [ChatSessionSchema], // قائمة جلسات الدردشة
});

const UserChats = mongoose.model("UserChats", UserChatsSchema);

module.exports = UserChats;
