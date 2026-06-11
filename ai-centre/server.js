const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Storage helpers ---------- */

const DATA_DIR = __dirname;
const file = (name) => path.join(DATA_DIR, name);

const USERS_FILE = file("users.json");
const EVENTS_FILE = file("events.json");
const ANNOUNCEMENTS_FILE = file("announcements.json");
const ATTENDANCE_FILE = file("attendance.json");
const MESSAGES_FILE = file("messages.json");
const SESSIONS_FILE = file("sessions.json");

function readJSON(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

const getUsers = () => readJSON(USERS_FILE, []);
const saveUsers = (u) => writeJSON(USERS_FILE, u);

function newId() {
  return crypto.randomBytes(8).toString("hex");
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Sessions persist to disk so a server restart doesn't log everyone out.
const sessions = readJSON(SESSIONS_FILE, {});
const saveSessions = () => writeJSON(SESSIONS_FILE, sessions);

/* ---------- Auth middleware ---------- */

function getSession(req) {
  const header = req.headers.authorization || "";
  const token =
    header.replace(/^Bearer\s+/i, "") ||
    (req.body && req.body.token) ||
    (req.query && req.query.token);
  return token ? sessions[token] : null;
}

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  req.user = session;
  next();
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (session.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admins only" });
  }
  req.user = session;
  next();
}

/* =========================================================
   AUTH
   ========================================================= */

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return res.json({ success: false, message: "Email already registered" });
  }

  // First registered user becomes the admin.
  const role = users.length === 0 ? "admin" : "member";
  const newUser = { name, email, password, role };
  users.push(newUser);
  saveUsers(users);

  const token = createToken();
  sessions[token] = { name, email, role };
  saveSessions();

  res.json({ success: true, user: { name, email, role }, token });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "Invalid email or password" });
  }

  const role = user.role || "member";
  const token = createToken();
  sessions[token] = { name: user.name, email: user.email, role };
  saveSessions();

  res.json({ success: true, user: { name: user.name, email: user.email, role }, token });
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
    saveSessions();
  }
  res.json({ success: true });
});

/* =========================================================
   ERP: MEMBERS  (admin)
   ========================================================= */

app.get("/api/members", requireAdmin, (req, res) => {
  const members = getUsers().map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role || "member",
  }));
  res.json({ success: true, members });
});

app.post("/api/members/role", requireAdmin, (req, res) => {
  const { email, role } = req.body;
  if (!["admin", "member"].includes(role)) {
    return res.json({ success: false, message: "Invalid role" });
  }
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) return res.json({ success: false, message: "Member not found" });

  user.role = role;
  saveUsers(users);

  // Keep any live sessions for this user in sync.
  Object.values(sessions).forEach((s) => {
    if (s.email === email) s.role = role;
  });
  saveSessions();

  res.json({ success: true });
});

app.post("/api/members/remove", requireAdmin, (req, res) => {
  const { email } = req.body;
  if (email === req.user.email) {
    return res.json({ success: false, message: "You cannot remove yourself" });
  }
  let users = getUsers();
  if (!users.find((u) => u.email === email)) {
    return res.json({ success: false, message: "Member not found" });
  }
  users = users.filter((u) => u.email !== email);
  saveUsers(users);

  // Invalidate that user's sessions.
  Object.keys(sessions).forEach((t) => {
    if (sessions[t].email === email) delete sessions[t];
  });
  saveSessions();

  res.json({ success: true });
});

/* =========================================================
   ERP: EVENTS / SESSIONS
   ========================================================= */

app.get("/api/events", requireAuth, (req, res) => {
  const events = readJSON(EVENTS_FILE, []).sort((a, b) =>
    (a.date || "").localeCompare(b.date || "")
  );
  res.json({ success: true, events });
});

app.post("/api/events", requireAdmin, (req, res) => {
  const { title, date, topic, details } = req.body;
  if (!title || !date) {
    return res.json({ success: false, message: "Title and date are required" });
  }
  const events = readJSON(EVENTS_FILE, []);
  const event = {
    id: newId(),
    title,
    date,
    topic: topic || "",
    details: details || "",
    createdBy: req.user.email,
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  writeJSON(EVENTS_FILE, events);
  res.json({ success: true, event });
});

app.post("/api/events/delete", requireAdmin, (req, res) => {
  const { id } = req.body;
  let events = readJSON(EVENTS_FILE, []);
  events = events.filter((e) => e.id !== id);
  writeJSON(EVENTS_FILE, events);

  // Drop attendance tied to the event.
  const attendance = readJSON(ATTENDANCE_FILE, {});
  delete attendance[id];
  writeJSON(ATTENDANCE_FILE, attendance);

  res.json({ success: true });
});

/* =========================================================
   ERP: ATTENDANCE
   attendance.json = { [eventId]: [email, email, ...] }
   ========================================================= */

app.get("/api/attendance", requireAuth, (req, res) => {
  const { eventId } = req.query;
  const attendance = readJSON(ATTENDANCE_FILE, {});
  if (eventId) {
    return res.json({ success: true, present: attendance[eventId] || [] });
  }
  res.json({ success: true, attendance });
});

app.post("/api/attendance", requireAdmin, (req, res) => {
  const { eventId, present } = req.body;
  if (!eventId || !Array.isArray(present)) {
    return res.json({ success: false, message: "eventId and present[] are required" });
  }
  const events = readJSON(EVENTS_FILE, []);
  if (!events.find((e) => e.id === eventId)) {
    return res.json({ success: false, message: "Event not found" });
  }
  const attendance = readJSON(ATTENDANCE_FILE, {});
  attendance[eventId] = present;
  writeJSON(ATTENDANCE_FILE, attendance);
  res.json({ success: true });
});

/* =========================================================
   ERP: ANNOUNCEMENTS
   ========================================================= */

app.get("/api/announcements", requireAuth, (req, res) => {
  const announcements = readJSON(ANNOUNCEMENTS_FILE, []).sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );
  res.json({ success: true, announcements });
});

app.post("/api/announcements", requireAdmin, (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.json({ success: false, message: "Title and body are required" });
  }
  const announcements = readJSON(ANNOUNCEMENTS_FILE, []);
  const announcement = {
    id: newId(),
    title,
    body,
    author: req.user.name,
    createdAt: new Date().toISOString(),
  };
  announcements.push(announcement);
  writeJSON(ANNOUNCEMENTS_FILE, announcements);
  res.json({ success: true, announcement });
});

app.post("/api/announcements/delete", requireAdmin, (req, res) => {
  const { id } = req.body;
  let announcements = readJSON(ANNOUNCEMENTS_FILE, []);
  announcements = announcements.filter((a) => a.id !== id);
  writeJSON(ANNOUNCEMENTS_FILE, announcements);
  res.json({ success: true });
});

/* =========================================================
   ERP: MESSAGES  (members -> admins, admins reply)
   ========================================================= */

app.post("/api/messages", requireAuth, (req, res) => {
  const { body } = req.body;
  if (!body) return res.json({ success: false, message: "Message cannot be empty" });

  const messages = readJSON(MESSAGES_FILE, []);
  const message = {
    id: newId(),
    fromName: req.user.name,
    fromEmail: req.user.email,
    body,
    reply: null,
    repliedAt: null,
    createdAt: new Date().toISOString(),
  };
  messages.push(message);
  writeJSON(MESSAGES_FILE, messages);
  res.json({ success: true, message });
});

// Members see their own thread; admins see everything.
app.get("/api/messages", requireAuth, (req, res) => {
  let messages = readJSON(MESSAGES_FILE, []);
  if (req.user.role !== "admin") {
    messages = messages.filter((m) => m.fromEmail === req.user.email);
  }
  messages.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  res.json({ success: true, messages });
});

app.post("/api/messages/reply", requireAdmin, (req, res) => {
  const { id, reply } = req.body;
  if (!reply) return res.json({ success: false, message: "Reply cannot be empty" });

  const messages = readJSON(MESSAGES_FILE, []);
  const message = messages.find((m) => m.id === id);
  if (!message) return res.json({ success: false, message: "Message not found" });

  message.reply = reply;
  message.repliedAt = new Date().toISOString();
  writeJSON(MESSAGES_FILE, messages);
  res.json({ success: true });
});

/* ---------- Misc ---------- */

app.get("/test", (req, res) => {
  res.send("Server working");
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
