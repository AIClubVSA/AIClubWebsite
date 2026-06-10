const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const USERS_FILE = path.join(__dirname, "users.json");
const sessions = {};

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const users = getUsers();

  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: "Email already registered" });
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  const token = createToken();
  sessions[token] = { name, email };

  res.json({ success: true, user: { name, email }, token });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "Invalid email or password" });
  }

  const token = createToken();
  sessions[token] = { name: user.name, email: user.email };

  res.json({ success: true, user: { name: user.name, email: user.email }, token });
});

app.post("/api/verify", (req, res) => {
  const { token } = req.body;
  const session = sessions[token];

  if (!session) {
    return res.json({ success: false, message: "Invalid session" });
  }

  res.json({ success: true, user: session });
});

app.post("/api/logout", (req, res) => {
  const { token } = req.body;

  if (token && sessions[token]) {
    delete sessions[token];
  }

  res.json({ success: true });
});

app.get("/test", (req, res) => {
  res.send("Server working");
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);