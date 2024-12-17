const express = require("express");
const http = require("http"); // استيراد http
const socketIo = require("socket.io"); // استيراد socket.io
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const UserChats = require("../Models/Chats");

const app = express();
const server = http.createServer(app); // إنشاء الخادم باستخدام http
const io = socketIo(server); // ربط socket.io مع الخادم

const router = express.Router();
// Middleware to set headers
const setHeadersMiddleware = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
};
// Apply middleware to the whole route
router.use(setHeadersMiddleware);


// إعدادات Multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chatFolder = `chatFiles/${req.body.chatID}`;
    const folderPath = path.join(__dirname, "public", chatFolder);
  
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 100)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Middleware for parsing JSON
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// إرسال الرسالة عبر Socket.IO
router.post("/sendMessage", TokenMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { senderUserName, receiverUserName, content } = req.body;
  
    if (!receiverUserName) {
      return res.status(400).json({ message: "username should be exist" });
    }
  
    const newMessage = {
      content: content || null,
      file: req.file ? `/uploads/${req.file.filename}` : null, // مسار الملف المرفوع
      received: false,
      seen: false,
      timestamp: Date.now(),
    };
  
    let senderChat = await UserChats.findOne({ userName: senderUserName });
    if (!senderChat) {
      senderChat = new UserChats({ userName: senderUserName, chats: [] });
    }
  
    let receiverChat = await UserChats.findOne({ userName: receiverUserName });
    if (!receiverChat) {
      receiverChat = new UserChats({ userName: receiverUserName, chats: [] });
    }
  
    // إضافة الرسالة لجلسة المُرسل
    const senderSession = senderChat.chats.find(chat => chat.senderUserName === receiverUserName);
    if (senderSession) {
      senderSession.messages.push(newMessage);
    } else {
      senderChat.chats.push({
        senderUserName: receiverUserName,
        messages: [newMessage],
      });
    }
  
    // إضافة الرسالة لجلسة المُستلم
    const receiverSession = receiverChat.chats.find(chat => chat.senderUserName === senderUserName);
    if (receiverSession) {
      receiverSession.messages.push(newMessage);
    } else {
      receiverChat.chats.push({
        senderUserName: senderUserName,
        messages: [newMessage],
      });
    }

    

    await senderChat.save();
    await receiverChat.save();
  
    // إرسال الرسالة عبر Socket.IO لكل من المرسل والمستلم
    io.to(receiverUserName).emit("receiveMessage", newMessage);  // ارسال الرسالة للمستقبل
    io.to(senderUserName).emit("receiveMessage", newMessage);  // ارسال الرسالة للمرسل
  
    res.status(200).json({ message: "sucesses to send message", data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in send message" });
  }
});


// تحديث حالة الرسائل إلى "received" عبر Socket.IO
io.on("connection", (socket) => {
  console.log("User connected via Socket.IO");

  socket.on("messageReceived", async ({ userName, senderUserName, messageId }) => {
    try {
      const userChat = await UserChats.findOne({ userName });
      if (!userChat) return;

      const chatSession = userChat.chats.find(chat => chat.senderUserName === senderUserName);
      if (!chatSession) return;

      const message = chatSession.messages.id(messageId);
      if (message) {
        message.received = true;
        await userChat.save();
      }
    } catch (error) {
      console.error("Error updating received status:", error);
    }
  });
});

// تحديث حالة الرسائل إلى "seen"
router.put("/markAsSeen/:userName/:senderUserName", TokenMiddleware, async (req, res) => {
  try {
    const { userName, senderUserName } = req.params;

    const userChat = await UserChats.findOne({ userName });
    if (!userChat) {
      return res.status(404).json({ message: "No chat found for this user." });
    }

    const chatSession = userChat.chats.find(chat => chat.senderUserName === senderUserName);
    if (!chatSession) {
      return res.status(404).json({ message: "No messages found between users." });
    }

    chatSession.messages.forEach(message => {
      message.seen = true;
    });

    await userChat.save();
    res.status(200).json({ message: "All messages marked as seen." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating messages to seen." });
  }
});
 


//get message==========================
router.get("/getMessages/:userName/:senderUserName", TokenMiddleware, async (req, res) => {
  try {
    const { userName, senderUserName } = req.params;
  
    // إيجاد دردشات المستخدم
    const userChats = await UserChats.findOne({userName});
    if (!userChats) {
      return res.status(404).json({ message: "no chat for this user" });
      
    }

    // إيجاد جلسة المحادثة
    const chatSession = userChats.chats.find(
      (chat) => chat.senderUserName === senderUserName
    );
    if (!chatSession) {
      return res.status(404).json({ message: "no message butween user" });
    }

    // إعادة الرسائل الموجودة في الجلسة
    res.status(200).json(chatSession.messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in get message" });
  }
});


module.exports = router;


  


