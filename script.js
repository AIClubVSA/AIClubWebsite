const paths = {
  beginner: {
    label: "Beginner path",
    title: "Learn the basics without feeling behind.",
    text: "You&apos;ll get plain-English explanations, low-pressure demos, and guided practice so AI stops feeling intimidating and starts feeling usable.",
    cards: [
      {
        title: "Learn the language",
        label: "Start here",
        items: [
          "What AI actually is, explained simply",
          "How to use popular tools without fear",
          "How to ask better questions and get better results",
        ],
      },
      {
        title: "Try it yourself",
        label: "Practice",
        items: [
          "Mini exercises and low-stakes experiments",
          "Hands-on demos with support nearby",
          "Small wins that build confidence quickly",
        ],
      },
      {
        title: "Join the team",
        label: "Belong",
        items: [
          "Work with people at your level",
          "Learn by watching and doing",
          "Contribute even if you have never coded before",
        ],
      },
    ],
  },
  builder: {
    label: "Builder path",
    title: "Turn curiosity into working code.",
    text: "If you already like coding, you can build practical tools, connect APIs, and ship small AI-powered ideas with a team.",
    cards: [
      {
        title: "Prototype quickly",
        label: "Build",
        items: [
          "Create mini apps with AI features",
          "Test ideas fast and improve them",
          "Learn how to make useful demos",
        ],
      },
      {
        title: "Work with APIs",
        label: "Connect",
        items: [
          "Use models through simple integrations",
          "Experiment with prompts and workflows",
          "See how real products use AI",
        ],
      },
      {
        title: "Show your work",
        label: "Ship",
        items: [
          "Create something worth presenting",
          "Present to the club and get feedback",
          "Learn how to explain what you built",
        ],
      },
    ],
  },
  creator: {
    label: "Creative path",
    title: "Make AI feel visual, original, and fun.",
    text: "If you love design, writing, music, or visuals, this club turns creative energy into builds with style and impact.",
    cards: [
      {
        title: "Design with AI",
        label: "Create",
        items: [
          "Make posters, concepts, and visuals",
          "Explore image generation responsibly",
          "Turn ideas into polished presentation pieces",
        ],
      },
      {
        title: "Tell a story",
        label: "Communicate",
        items: [
          "Learn how to explain AI in simple language",
          "Use writing and visuals together",
          "Make your builds stand out in demos",
        ],
      },
      {
        title: "Experiment freely",
        label: "Explore",
        items: [
          "Try creative prompts and techniques",
          "Compare different AI tools",
          "Find your own style while learning",
        ],
      },
    ],
  },
  leader: {
    label: "Leader path",
    title: "Build confidence, run events, and help shape the club.",
    text: "If you want leadership experience, the AI Centre gives you a chance to mentor others, host sessions, and grow your voice.",
    cards: [
      {
        title: "Lead sessions",
        label: "Guide",
        items: [
          "Support workshops and small groups",
          "Help newer members get started",
          "Practice explaining ideas clearly",
        ],
      },
      {
        title: "Run events",
        label: "Organise",
        items: [
          "Help plan showcases and challenges",
          "Take part in competitions and demos",
          "Build confidence through responsibility",
        ],
      },
      {
        title: "Shape the club",
        label: "Influence",
        items: [
          "Suggest new builds and themes",
          "Collaborate with teachers and peers",
          "Leave your mark on the club culture",
        ],
      },
    ],
  },
};

const sessions = [
  {
    title: "Skill-building workshop",
    label: "Learn",
    items: [
      "Short, focused teaching on a useful AI topic",
      "Examples that make the idea easy to understand",
      "Time to try the tool right away",
    ],
  },
  {
    title: "Build sprint",
    label: "Build",
    items: [
      "Work in teams on a mini challenge",
      "Create something tangible in one session",
      "Leave with a result, not just notes",
    ],
  },
  {
    title: "Showcase or challenge",
    label: "Share",
    items: [
      "Present work to the club",
      "Swap feedback and ideas",
      "Celebrate progress, not perfection",
    ],
  },
];

const tools = [
  {
    title: "AI tools",
    label: "Access",
    items: [
      "ChatGPT, Gemini, and Claude for brainstorming and prompt practice",
      "Canva AI and Adobe Firefly for creative work",
      "Simple ways to explore image, text, and code generation",
    ],
  },
  {
    title: "Build tools",
    label: "Create",
    items: [
      "Google Colab for notebooks",
      "GitHub for versions and team work",
      "Python, Scikit-learn, TensorFlow, and PyTorch for deeper builds",
    ],
  },
];

const faqs = [
  {
    question: "Do I need to know how to code?",
    answer: "No. The club is built for beginners too. You can join to learn, explore, design, present, or gradually move into coding once you feel ready.",
  },
  {
    question: "What if I only use AI tools casually?",
    answer: "That is a great place to start. The club helps you move from casual use to understanding how AI works and how to use it well.",
  },
  {
    question: "Will I actually make things?",
    answer: "Yes. The focus is on builds, demos, and small wins that turn into real confidence over time.",
  },
  {
    question: "Is it only for tech students?",
    answer: "Not at all. Designers, writers, debaters, leaders, and curious students all have a place here.",
  },
  {
    question: "How often do sessions happen?",
    answer: "The club is designed around regular weekly time, with some extra events, showcases, and challenges when possible.",
  },
  {
    question: "Why join this instead of another club?",
    answer: "Because it mixes creativity, practical skills, and future-ready learning in a way that feels modern, useful, and social.",
  },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCards(targetId, cards, variant = "track") {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = cards
    .map(
      (card) => `
        <article class="${variant}-card reveal-item">
          <div class="${variant}-card__header">
            <h3>${escapeHtml(card.title)}</h3>
            <span>${escapeHtml(card.label)}</span>
          </div>
          <ul>
            ${card.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>
      `,
    )
    .join("");
}

function renderFaqs(targetId, items) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = items
    .map(
      (item, index) => `
        <article class="faq-item reveal-item">
          <button class="faq-toggle" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
            <span>${escapeHtml(item.question)}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </button>
          <div class="faq-panel" ${index === 0 ? "" : "hidden"}>
            <p>${escapeHtml(item.answer)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function setPath(pathName) {
  const data = paths[pathName];
  if (!data) return;

  const label = document.getElementById("path-label");
  const title = document.getElementById("path-title");
  const text = document.getElementById("path-text");
  const grid = document.getElementById("path-grid");

  if (label) label.textContent = data.label;
  if (title) title.textContent = data.title;
  if (text) text.innerHTML = data.text.replace(/&apos;/g, "'");

  if (grid) {
    grid.innerHTML = data.cards
      .map(
        (card) => `
          <article class="path-card reveal-item">
            <div class="path-card__header">
              <h4>${escapeHtml(card.title)}</h4>
              <span>${escapeHtml(card.label)}</span>
            </div>
            <ul>
              ${card.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
        `,
      )
      .join("");
  }
}

function initPathSwitcher() {
  const buttons = [...document.querySelectorAll(".path-button")];
  if (!buttons.length) return;

  const activate = (button) => {
    const pathName = button.dataset.path;
    buttons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    setPath(pathName);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => activate(button));
  });

  activate(buttons[0]);
}

function initFaqAccordion() {
  const items = [...document.querySelectorAll(".faq-item")];
  items.forEach((item) => {
    const button = item.querySelector(".faq-toggle");
    const panel = item.querySelector(".faq-panel");

    if (!button || !panel) return;

    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
}

function initMobileNav() {
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".site-nav");
  if (!button || !nav) return;

  const setOpen = (isOpen) => {
    button.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
  };

  button.addEventListener("click", () => {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) setOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !button.contains(event.target)) {
      setOpen(false);
    }
  });
}

function initActiveNav() {
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (!visible.length) return;

      const topSection = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0].target.id;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${topSection}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    },
    { threshold: [0.35, 0.5, 0.65] },
  );

  sections.forEach((section) => observer.observe(section));
}

function initCounters() {
  const counters = [...document.querySelectorAll(".counter")];
  counters.forEach((counter) => {
    counter.textContent = String(counter.dataset.target || counter.textContent);
  });
}

function initRevealOnScroll() {
  const elements = [...document.querySelectorAll(".reveal-item")];
  if (!elements.length || !("IntersectionObserver" in window)) return;

  elements.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  elements.forEach((element) => observer.observe(element));
}

function initHeroGlow() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--pointer-x", `${x}%`);
    hero.style.setProperty("--pointer-y", `${y}%`);
  });
}

function initFooterYear() {
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());
}

renderCards("sessions-grid", sessions, "track");
renderCards("tools-grid", tools, "resource");
renderFaqs("faq-list", faqs);
initPathSwitcher();
initFaqAccordion();
initMobileNav();
initActiveNav();
initCounters();
initRevealOnScroll();
initHeroGlow();
initFooterYear();
