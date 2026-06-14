/* =========================================================
   AI Centre | Vidyashilp Academy
   Populates dynamic sections, handles UI behaviour, and
   wires the login / signup flow to the Express auth API.
   ========================================================= */

/* ---------- Content data ---------- */

const PATHS = {
  beginner: {
    label: "Beginner path",
    title: "Learn the basics without feeling behind.",
    text:
      "You'll get plain-English explanations, low-pressure demos, and guided practice so AI stops feeling intimidating and starts feeling usable.",
    cards: [
      { icon: "🧭", title: "Gentle intros", text: "Short, friendly sessions that explain what AI is and how to actually use it." },
      { icon: "🛠️", title: "Guided builds", text: "Follow along to make your first chatbot or smart tool with help at every step." },
      { icon: "🤝", title: "No judgement", text: "Ask anything. Everyone here started somewhere, so questions are welcome." },
    ],
  },
  builder: {
    label: "Builder path",
    title: "Turn ideas into working projects.",
    text:
      "If you like coding, you'll prototype apps, connect APIs, and ship small tools you can show off and keep improving.",
    cards: [
      { icon: "💻", title: "Real prototypes", text: "Build mini apps and automations with Python, JavaScript, and AI APIs." },
      { icon: "🔌", title: "Connect tools", text: "Plug models into bots, sheets, and websites to make them genuinely useful." },
      { icon: "🚀", title: "Ship & iterate", text: "Demo your build, get feedback, and level it up for competitions." },
    ],
  },
  creator: {
    label: "Creator path",
    title: "Design, generate, and tell better stories.",
    text:
      "Love design? Use AI for visuals, branding, video, and writing while learning to keep your work original and intentional.",
    cards: [
      { icon: "🎨", title: "AI visuals", text: "Generate art, posters, and brand kits, then refine them with real design taste." },
      { icon: "✍️", title: "Smart writing", text: "Draft scripts, posts, and stories faster while keeping your own voice." },
      { icon: "🎬", title: "Media projects", text: "Make short videos, slides, and presentations that actually impress." },
    ],
  },
  leader: {
    label: "Leader path",
    title: "Run sessions and grow the community.",
    text:
      "Want to lead? Help organise events, mentor newcomers, and shape where the club goes next.",
    cards: [
      { icon: "📣", title: "Host events", text: "Plan workshops, demo days, and competitions the whole school wants to join." },
      { icon: "🧑‍🏫", title: "Mentor others", text: "Help beginners get unstuck and build their confidence with AI." },
      { icon: "🌱", title: "Shape the club", text: "Pitch ideas, set the direction, and leave the club better than you found it." },
    ],
  },
};

const SESSIONS = [
  { icon: "🧠", title: "Learn something new", text: "A quick, practical concept or tool, explained in a way that sticks." },
  { icon: "⚡", title: "Build in the room", text: "Hands-on time where you actually make or improve something live." },
  { icon: "🎯", title: "Challenges & demos", text: "Friendly competitions and show-and-tell so your work gets seen." },
];

const TOOLS = [
  { tag: "Chat", name: "ChatGPT / Gemini", text: "Brainstorm, explain, and draft ideas with conversational AI." },
  { tag: "Code", name: "Google Colab", text: "Write and run Python in the browser, no setup needed." },
  { tag: "Visuals", name: "Canva + AI", text: "Design posters, slides, and graphics with AI-assisted tools." },
  { tag: "Build", name: "Replit", text: "Prototype small web apps and bots straight from a browser." },
];

const FAQS = [
  { q: "Do I need any experience with AI or coding?", a: "Not at all. The club is designed for complete beginners. If you are curious and willing to try, you already qualify." },
  { q: "What will we actually do in meetings?", a: "A mix of short learning, hands-on building, demos, and friendly challenges. Sessions are practical and social, not lecture-heavy." },
  { q: "Do I need an expensive laptop or software?", a: "No. We focus on free tools that run in a browser, so school laptops or BYOD devices work fine." },
  { q: "Is it only for tech students?", a: "No. We welcome designers, writers, debaters, gamers, and anyone curious. AI touches every interest." },
  { q: "How much time does it take?", a: "Just the weekly session. You can do more if you want, but there is no pressure to commit huge amounts of time." },
];

/* ---------- DOM helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

/* ---------- Render dynamic content ---------- */

function renderPath(key) {
  const data = PATHS[key] || PATHS.beginner;
  $("#path-label").textContent = data.label;
  $("#path-title").textContent = data.title;
  $("#path-text").textContent = data.text;

  const grid = $("#path-grid");
  grid.innerHTML = "";
  data.cards.forEach((c) => {
    const card = el(
      "article",
      "mini-card reveal-item",
      `<span class="mini-card__icon" aria-hidden="true">${c.icon}</span><h4>${c.title}</h4><p>${c.text}</p>`
    );
    grid.appendChild(card);
  });
  revealNow(grid);
}

function renderSessions() {
  const grid = $("#sessions-grid");
  SESSIONS.forEach((s) => {
    grid.appendChild(
      el(
        "article",
        "mini-card reveal-item",
        `<span class="mini-card__icon" aria-hidden="true">${s.icon}</span><h4>${s.title}</h4><p>${s.text}</p>`
      )
    );
  });
}

function renderTools() {
  const grid = $("#tools-grid");
  TOOLS.forEach((t) => {
    grid.appendChild(
      el(
        "article",
        "resource-card reveal-item",
        `<span class="tag">${t.tag}</span><h4>${t.name}</h4><p>${t.text}</p>`
      )
    );
  });
}

function renderFaq() {
  const list = $("#faq-list");
  FAQS.forEach((f, i) => {
    const item = el("div", "faq-item reveal-item");
    const btn = el(
      "button",
      "faq-question",
      `<span>${f.q}</span><span class="faq-icon" aria-hidden="true">+</span>`
    );
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    const answer = el("div", "faq-answer", `<p>${f.a}</p>`);

    btn.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0";
    });

    item.appendChild(btn);
    item.appendChild(answer);
    list.appendChild(item);
  });
}

/* ---------- Path switcher ---------- */

function initPathSwitcher() {
  const buttons = $$(".path-button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderPath(btn.dataset.path);
    });
  });
}

/* ---------- Mobile nav ---------- */

function initMenu() {
  const button = $(".menu-button");
  const nav = $("#site-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Counters ---------- */

function animateCounter(node) {
  const target = Number(node.dataset.target || 0);
  const duration = 1100;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(target * eased).toString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Scroll reveal ---------- */

let revealObserver;

// Stagger reveal-items relative to their siblings for a cascading entrance.
function applyStagger(items) {
  const seen = new Map();
  items.forEach((n) => {
    const p = n.parentElement;
    const i = seen.get(p) || 0;
    seen.set(p, i + 1);
    n.style.setProperty("--reveal-delay", (i * 0.07).toFixed(2) + "s");
  });
}

function initReveal() {
  // Promote section headings so every section animates in on scroll.
  $$(".section-heading").forEach((n) => n.classList.add("reveal-item"));

  const items = $$(".reveal-item");
  applyStagger(items);

  if (!("IntersectionObserver" in window)) {
    items.forEach((n) => n.classList.add("is-visible"));
    $$(".counter").forEach(animateCounter);
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        $$(".counter", entry.target).forEach(animateCounter);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((n) => revealObserver.observe(n));
  // Counters live in the hero (above the fold), so animate them right away
  // rather than waiting on an intersection that may never be reported.
  $$(".counter").forEach(animateCounter);
}

// Observe items added after initial reveal setup (e.g. switched path cards)
function revealNow(root) {
  const items = $$(".reveal-item", root);
  applyStagger(items);
  items.forEach((n) => {
    if (revealObserver) revealObserver.observe(n);
    else n.classList.add("is-visible");
  });
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.width = (pct * 100).toFixed(2) + "%";
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}

/* ---------- Hero parallax (skipped when motion is reduced) ---------- */
function initParallax() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layers = [
    [document.querySelector(".hero-orb--one"), 0.28],
    [document.querySelector(".hero-orb--two"), -0.2],
    [document.querySelector(".hero-copy"), 0.08],
    [document.querySelector(".hero-panel"), 0.18],
  ].filter(([node]) => node);
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (y < 900) {
      for (const [node, rate] of layers) node.style.translate = `0 ${(y * rate).toFixed(1)}px`;
    }
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* =========================================================
   AUTH — talks to the Express API in server.js
   ========================================================= */

const Auth = {
  TOKEN_KEY: "aicentre_token",

  token() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  async api(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  setLoggedIn(user) {
    $("#auth-guest").hidden = true;
    const userBox = $("#auth-user");
    userBox.hidden = false;
    $("#auth-user-name").textContent = user.name;
  },

  setLoggedOut() {
    $("#auth-guest").hidden = false;
    $("#auth-user").hidden = true;
  },

  async signup(data) {
    return this.api("/api/signup", data);
  },

  async login(data) {
    return this.api("/api/login", data);
  },

  async logout() {
    const token = this.token();
    if (token) await this.api("/api/logout", { token });
    localStorage.removeItem(this.TOKEN_KEY);
    this.setLoggedOut();
  },

  async restore() {
    const token = this.token();
    if (!token) return;
    const result = await this.api("/api/verify", { token });
    if (result.success) {
      this.setLoggedIn(result.user);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      this.setLoggedOut();
    }
  },
};

/* ---------- Auth modal UI ---------- */

const modal = {
  root: null,
  message: null,

  init() {
    this.root = $("#auth-modal");
    this.message = $("#auth-message");
    if (!this.root) return;

    // Open triggers (header buttons + hero/CTA buttons)
    $$("[data-auth-open]").forEach((btn) =>
      btn.addEventListener("click", () => this.open(btn.dataset.authOpen))
    );

    // Close triggers
    $$("[data-auth-close]", this.root).forEach((node) =>
      node.addEventListener("click", () => this.close())
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.root.hidden) this.close();
    });

    // Tab switching
    $$(".auth-tab").forEach((tab) =>
      tab.addEventListener("click", () => this.switchTo(tab.dataset.authTab))
    );

    // Form submits
    $("#login-form").addEventListener("submit", (e) => this.handleLogin(e));
    $("#signup-form").addEventListener("submit", (e) => this.handleSignup(e));

    // Logout
    $("#auth-logout").addEventListener("click", () => Auth.logout());
  },

  open(tab = "login") {
    this.clearMessage();
    this.switchTo(tab);
    this.root.hidden = false;
    document.body.classList.add("modal-open");
    const firstInput = $(`#${tab}-form input`);
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  },

  close() {
    this.root.hidden = true;
    document.body.classList.remove("modal-open");
  },

  switchTo(tab) {
    const isLogin = tab !== "signup";
    $$(".auth-tab").forEach((t) => {
      const active = t.dataset.authTab === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    $("#login-form").hidden = !isLogin;
    $("#signup-form").hidden = isLogin;
    $("#auth-modal-title").textContent = isLogin ? "Welcome back" : "Join the AI Centre";
    this.clearMessage();
  },

  showMessage(text, type) {
    this.message.textContent = text;
    this.message.className = "auth-message is-" + type;
    this.message.hidden = false;
  },

  clearMessage() {
    this.message.hidden = true;
    this.message.textContent = "";
  },

  async handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      email: form.email.value.trim(),
      password: form.password.value,
    };
    this.lock(form, true);
    try {
      const result = await Auth.login(data);
      if (result.success) {
        localStorage.setItem(Auth.TOKEN_KEY, result.token);
        Auth.setLoggedIn(result.user);
        this.showMessage(`Logged in as ${result.user.name}.`, "success");
        setTimeout(() => this.close(), 800);
        form.reset();
      } else {
        this.showMessage(result.message || "Login failed.", "error");
      }
    } catch (err) {
      this.showMessage("Could not reach the server. Is it running?", "error");
    } finally {
      this.lock(form, false);
    }
  },

  async handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
    };
    this.lock(form, true);
    try {
      const result = await Auth.signup(data);
      if (result.success) {
        localStorage.setItem(Auth.TOKEN_KEY, result.token);
        Auth.setLoggedIn(result.user);
        this.showMessage(`Welcome, ${result.user.name}! You're in.`, "success");
        setTimeout(() => this.close(), 900);
        form.reset();
      } else {
        this.showMessage(result.message || "Sign up failed.", "error");
      }
    } catch (err) {
      this.showMessage("Could not reach the server. Is it running?", "error");
    } finally {
      this.lock(form, false);
    }
  },

  lock(form, locked) {
    $$("input, button", form).forEach((node) => (node.disabled = locked));
  },
};

/* ---------- Boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderPath("beginner");
  renderSessions();
  renderTools();
  renderFaq();

  initPathSwitcher();
  initMenu();
  initReveal();
  initScrollProgress();
  initParallax();

  modal.init();
  Auth.restore();

  const yearNode = $("#footer-year");
  if (yearNode) yearNode.textContent = `© ${new Date().getFullYear()} AI Centre`;
});
