require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== CONNECT DB =====
connectDB();

// ===== TEST =====
app.get("/", (req, res) => {
  res.send("API running");
});

// ===============================
// ===== MESSAGE APIs =====
// ===============================

// Send message
app.post("/message", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // 🔥 DEBUG

    const { sender, receiver, text } = req.body;

    // ✅ VALIDATION
    if (!sender || !receiver || !text) {
      console.log("❌ Missing fields:", { sender, receiver, text });
      return res.status(400).json({ msg: "Missing fields" });
    }

    const msg = await Message.create({
      sender: sender.toLowerCase(),
      receiver: receiver.toLowerCase(),
      text,
    });

    res.json(msg);
  } catch (error) {
    console.error("❌ MESSAGE ERROR:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get messages
// app.get("/messages", async (req, res) => {
//   try {
//     const { user1, user2 } = req.query;

//     const u1 = user1.toLowerCase();
//     const u2 = user2.toLowerCase();

//     const messages = await Message.find({
//       $or: [
//         { sender: u1, receiver: u2 },
//         { sender: u2, receiver: u1 },
//       ],
//     }).sort({ createdAt: 1 });

//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch messages" });
//   }
// });

app.get("/messages", async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ msg: "Missing users" });
    }

    const u1 = user1.toLowerCase().trim();
    const u2 = user2.toLowerCase().trim();

    console.log("FETCH:", u1, u2);

    const messages = await Message.find({
      $or: [
        { sender: u1, receiver: u2 },
        { sender: u2, receiver: u1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ===============================
// ===== USER APIs =====
// ===============================

function generateUsername() {
  const adjectives = [
    "cool", "fast", "dark", "silent", "smart", "wild", "brave",
    "happy", "lucky", "crazy", "sharp", "ghost", "storm", "fire",
    "icy", "rapid", "mystic", "neon", "urban", "cyber"
  ];

  const nouns = [
    "tiger", "ninja", "coder", "wolf", "hawk", "lion", "dragon",
    "hunter", "rider", "shadow", "king", "queen", "ghost",
    "player", "hero", "bot", "dev", "warrior", "gamer"
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);

  return `${adj}${noun}${num}`;
}

app.get("/username/suggest", async (req, res) => {
  let username;
  let exists = true;

  while (exists) {
    username = generateUsername();
    exists = await User.findOne({ username });
  }

  res.json({ username });
});

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const u = username.toLowerCase();

  const exist = await User.findOne({ username: u });
  if (exist) return res.status(400).json({ msg: "Username taken" });

  const user = await User.create({ username: u, password });

  res.json({ username: user.username });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const u = username.toLowerCase();

  const user = await User.findOne({ username: u });
  if (!user) return res.status(400).json({ msg: "User not found" });

  if (user.password !== password)
    return res.status(400).json({ msg: "Wrong password" });

  res.json({ username: user.username });
});

// Search users
app.get("/search", async (req, res) => {
  const q = req.query.username;

  if (!q) return res.json([]);

  const users = await User.find({
    username: { $regex: "^" + q.toLowerCase(), $options: "i" },
  }).limit(10);

  res.json(users);
});

// ===============================
// ===== SOCKET.IO =====
// ===============================

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 ONLINE USERS MAP
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // 🔥 JOIN
  socket.on("join", (username) => {
    const user = username.toLowerCase().trim();

    console.log("🔥 JOIN:", user);

    socket.username = user;
    onlineUsers[user] = socket.id;

    console.log("🟢 ONLINE USERS:", onlineUsers);

    io.emit("online_users", Object.keys(onlineUsers));
  });

  // 🔥 SEND MESSAGE
  socket.on("send_message", (data) => {
    const receiver = data.receiver.toLowerCase();
    const receiverSocket = onlineUsers[receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", data);
    }
  });

  // 🔥 TYPING START
  socket.on("typing", ({ sender, receiver }) => {
    const s = sender.toLowerCase().trim();
    const r = receiver.toLowerCase().trim();

    console.log("⌨️ TYPING:", s, "→", r);

    const receiverSocket = onlineUsers[r];

    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { sender: s });
    } else {
      console.log("❌ Receiver not online:", r);
    }
  });

  // 🔥 TYPING STOP
  socket.on("stop_typing", ({ sender, receiver }) => {
    const s = sender.toLowerCase().trim();
    const r = receiver.toLowerCase().trim();

    console.log("🛑 STOP:", s, "→", r);

    const receiverSocket = onlineUsers[r];

    if (receiverSocket) {
      io.to(receiverSocket).emit("stop_typing", { sender: s });
    }
  });

  // 🔥 DISCONNECT
  socket.on("disconnect", () => {
    const username = socket.username;

    if (username && onlineUsers[username]) {
      delete onlineUsers[username];

      console.log("❌ DISCONNECTED:", username);

      io.emit("online_users", Object.keys(onlineUsers));
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get("/conversations/:username", async (req, res) => {
  try {
    const user = req.params.username.toLowerCase();

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: user },
            { receiver: user }
          ]
        }
      },
      {
        $project: {
          user: {
            $cond: [
              { $eq: ["$sender", user] },
              "$receiver",
              "$sender"
            ]
          },
          text: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$user",
          lastMessage: { $first: "$text" },
          time: { $first: "$createdAt" }
        }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch conversations" });
  }
});

