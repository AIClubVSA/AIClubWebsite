/* =========================================================
   AI Centre — ERP dashboard
   Auth-gated. Talks to the API in server.js using the token
   saved by the landing page (localStorage: aicentre_token).
   ========================================================= */

const TOKEN_KEY = "aicentre_token";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

let CURRENT = null; // { name, email, role }

/* ---------- API helper ---------- */

async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const opts = {
    method,
    headers: { Authorization: "Bearer " + token },
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    location.href = "index.html";
    throw new Error("Not authenticated");
  }
  return res.json();
}

/* ---------- Utilities ---------- */

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

let toastTimer;
function toast(message, type = "success") {
  let node = $(".erp-toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "erp-toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.className = "erp-toast is-" + type;
  requestAnimationFrame(() => node.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 2600);
}

const isAdmin = () => CURRENT && CURRENT.role === "admin";

/* =========================================================
   VIEWS
   ========================================================= */

const VIEWS = {
  /* ---- Overview ---- */
  async overview(root) {
    root.innerHTML = `<p class="erp-muted">Loading…</p>`;
    const [ann, ev, msg] = await Promise.all([
      api("/api/announcements"),
      api("/api/events"),
      api("/api/messages"),
    ]);
    let memberCount = null;
    if (isAdmin()) {
      const m = await api("/api/members");
      memberCount = (m.members || []).length;
    }

    const events = ev.events || [];
    const now = new Date();
    const upcoming = events.filter((e) => new Date(e.date) >= new Date(now.toDateString()));

    const tiles = [
      memberCount != null ? { value: memberCount, label: "Members" } : null,
      { value: events.length, label: "Total events" },
      { value: upcoming.length, label: "Upcoming events" },
      { value: (ann.announcements || []).length, label: "Announcements" },
      { value: (msg.messages || []).length, label: isAdmin() ? "Messages received" : "My messages" },
    ].filter(Boolean);

    const next = upcoming.sort((a, b) => a.date.localeCompare(b.date))[0];
    const latest = (ann.announcements || [])[0];

    root.innerHTML = `
      <div class="erp-stats">
        ${tiles
          .map(
            (t) => `<div class="erp-stat"><div class="erp-stat__value">${t.value}</div><div class="erp-stat__label">${t.label}</div></div>`
          )
          .join("")}
      </div>

      <div class="erp-card">
        <h3 class="erp-section-title">Next event</h3>
        ${
          next
            ? `<h4>${esc(next.title)}</h4><p class="meta">${fmtDate(next.date)}${next.topic ? " • " + esc(next.topic) : ""}</p><p class="erp-muted">${esc(next.details) || "No details yet."}</p>`
            : `<p class="erp-empty">No upcoming events scheduled.</p>`
        }
      </div>

      <div class="erp-card">
        <h3 class="erp-section-title">Latest announcement</h3>
        ${
          latest
            ? `<h4>${esc(latest.title)}</h4><p class="meta">${fmtDateTime(latest.createdAt)} • ${esc(latest.author)}</p><p class="erp-muted">${esc(latest.body)}</p>`
            : `<p class="erp-empty">Nothing posted yet.</p>`
        }
      </div>
    `;
  },

  /* ---- Announcements ---- */
  async announcements(root) {
    const { announcements = [] } = await api("/api/announcements");

    const adminForm = isAdmin()
      ? `<div class="erp-card">
           <h3 class="erp-section-title">Post an announcement</h3>
           <form class="erp-form" id="ann-form">
             <div class="erp-field"><span>Title</span><input name="title" required /></div>
             <div class="erp-field"><span>Message</span><textarea name="body" required></textarea></div>
             <div><button class="button button--primary" type="submit">Publish</button></div>
           </form>
         </div>`
      : "";

    const list = announcements.length
      ? `<div class="erp-list">${announcements
          .map(
            (a) => `<div class="erp-item">
              <div class="erp-item__body">
                <h4>${esc(a.title)}</h4>
                <p class="meta">${fmtDateTime(a.createdAt)} • ${esc(a.author)}</p>
                <p>${esc(a.body)}</p>
              </div>
              ${isAdmin() ? `<div class="erp-item__actions"><button class="button button--danger" data-del="${a.id}">Delete</button></div>` : ""}
            </div>`
          )
          .join("")}</div>`
      : `<p class="erp-empty">No announcements yet.</p>`;

    root.innerHTML = adminForm + list;

    const form = $("#ann-form", root);
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const r = await api("/api/announcements", {
          method: "POST",
          body: { title: form.title.value.trim(), body: form.body.value.trim() },
        });
        if (r.success) {
          toast("Announcement published");
          render("announcements");
        } else toast(r.message || "Failed", "error");
      });
    }
    $$("[data-del]", root).forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this announcement?")) return;
        await api("/api/announcements/delete", { method: "POST", body: { id: btn.dataset.del } });
        toast("Deleted");
        render("announcements");
      })
    );
  },

  /* ---- Events ---- */
  async events(root) {
    const { events = [] } = await api("/api/events");

    const adminForm = isAdmin()
      ? `<div class="erp-card">
           <h3 class="erp-section-title">Schedule an event / session</h3>
           <form class="erp-form" id="ev-form">
             <div class="row">
               <div class="erp-field"><span>Title</span><input name="title" required /></div>
               <div class="erp-field"><span>Date</span><input name="date" type="date" required /></div>
             </div>
             <div class="erp-field"><span>Topic</span><input name="topic" placeholder="e.g. Intro to prompting" /></div>
             <div class="erp-field"><span>Details</span><textarea name="details"></textarea></div>
             <div><button class="button button--primary" type="submit">Add event</button></div>
           </form>
         </div>`
      : "";

    const list = events.length
      ? `<div class="erp-list">${events
          .map(
            (ev) => `<div class="erp-item">
              <div class="erp-item__body">
                <h4>${esc(ev.title)}</h4>
                <p class="meta">${fmtDate(ev.date)}${ev.topic ? " • " + esc(ev.topic) : ""}</p>
                ${ev.details ? `<p>${esc(ev.details)}</p>` : ""}
              </div>
              ${isAdmin() ? `<div class="erp-item__actions"><button class="button button--danger" data-del="${ev.id}">Delete</button></div>` : ""}
            </div>`
          )
          .join("")}</div>`
      : `<p class="erp-empty">No events scheduled yet.</p>`;

    root.innerHTML = adminForm + list;

    const form = $("#ev-form", root);
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const r = await api("/api/events", {
          method: "POST",
          body: {
            title: form.title.value.trim(),
            date: form.date.value,
            topic: form.topic.value.trim(),
            details: form.details.value.trim(),
          },
        });
        if (r.success) {
          toast("Event added");
          render("events");
        } else toast(r.message || "Failed", "error");
      });
    }
    $$("[data-del]", root).forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this event? Its attendance will be removed too.")) return;
        await api("/api/events/delete", { method: "POST", body: { id: btn.dataset.del } });
        toast("Deleted");
        render("events");
      })
    );
  },

  /* ---- Attendance (admin) ---- */
  async attendance(root) {
    root.innerHTML = `<p class="erp-muted">Loading…</p>`;
    const [{ events = [] }, { members = [] }, { attendance = {} }] = await Promise.all([
      api("/api/events"),
      api("/api/members"),
      api("/api/attendance"),
    ]);

    if (!events.length) {
      root.innerHTML = `<p class="erp-empty">Create an event first, then take attendance.</p>`;
      return;
    }

    const options = events
      .map((e) => `<option value="${e.id}">${esc(e.title)} — ${fmtDate(e.date)}</option>`)
      .join("");

    root.innerHTML = `
      <div class="erp-card">
        <h3 class="erp-section-title">Take attendance</h3>
        <div class="erp-field" style="max-width:420px">
          <span>Event</span>
          <select id="att-event">${options}</select>
        </div>
        <div class="attendance-checklist" id="att-list"></div>
        <button class="button button--primary" id="att-save">Save attendance</button>
      </div>
    `;

    const listEl = $("#att-list", root);
    const select = $("#att-event", root);

    function paint() {
      const present = attendance[select.value] || [];
      listEl.innerHTML = members
        .map(
          (m) => `<label><input type="checkbox" value="${esc(m.email)}" ${
            present.includes(m.email) ? "checked" : ""
          } /> ${esc(m.name)} <span class="erp-muted">(${esc(m.email)})</span></label>`
        )
        .join("");
    }
    paint();
    select.addEventListener("change", paint);

    $("#att-save", root).addEventListener("click", async () => {
      const present = $$("#att-list input:checked", root).map((i) => i.value);
      const r = await api("/api/attendance", {
        method: "POST",
        body: { eventId: select.value, present },
      });
      if (r.success) {
        attendance[select.value] = present;
        toast(`Saved — ${present.length} present`);
      } else toast(r.message || "Failed", "error");
    });
  },

  /* ---- Members (admin) ---- */
  async members(root) {
    const { members = [] } = await api("/api/members");
    root.innerHTML = `
      <div class="erp-card">
        <h3 class="erp-section-title">Members (${members.length})</h3>
        <table class="erp-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
          <tbody>
            ${members
              .map(
                (m) => `<tr>
                  <td>${esc(m.name)}</td>
                  <td class="erp-muted">${esc(m.email)}</td>
                  <td><span class="erp-badge ${m.role === "admin" ? "is-admin" : ""}">${esc(m.role)}</span></td>
                  <td style="text-align:right; white-space:nowrap;">
                    ${
                      m.email === CURRENT.email
                        ? `<span class="erp-muted">you</span>`
                        : `<button class="button button--secondary" data-role="${esc(m.email)}" data-next="${m.role === "admin" ? "member" : "admin"}">
                             ${m.role === "admin" ? "Make member" : "Make admin"}
                           </button>
                           <button class="button button--danger" data-remove="${esc(m.email)}">Remove</button>`
                    }
                  </td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    $$("[data-role]", root).forEach((btn) =>
      btn.addEventListener("click", async () => {
        const r = await api("/api/members/role", {
          method: "POST",
          body: { email: btn.dataset.role, role: btn.dataset.next },
        });
        if (r.success) {
          toast("Role updated");
          render("members");
        } else toast(r.message || "Failed", "error");
      })
    );
    $$("[data-remove]", root).forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm(`Remove ${btn.dataset.remove}?`)) return;
        const r = await api("/api/members/remove", { method: "POST", body: { email: btn.dataset.remove } });
        if (r.success) {
          toast("Member removed");
          render("members");
        } else toast(r.message || "Failed", "error");
      })
    );
  },

  /* ---- Messages ---- */
  async messages(root) {
    const { messages = [] } = await api("/api/messages");

    const composer = !isAdmin()
      ? `<div class="erp-card">
           <h3 class="erp-section-title">Message the admins</h3>
           <form class="erp-form" id="msg-form">
             <div class="erp-field"><span>Your message</span><textarea name="body" required placeholder="Ask a question or share an idea…"></textarea></div>
             <div><button class="button button--primary" type="submit">Send</button></div>
           </form>
         </div>`
      : `<p class="erp-muted" style="margin-bottom:18px;">Messages from members. Reply and they'll see it on their dashboard.</p>`;

    const list = messages.length
      ? `<div class="erp-list">${messages
          .map(
            (m) => `<div class="erp-item">
              <div class="erp-item__body" style="flex:1">
                <h4>${esc(m.fromName)} ${isAdmin() ? `<span class="erp-muted" style="font-weight:400">(${esc(m.fromEmail)})</span>` : ""}</h4>
                <p class="meta">${fmtDateTime(m.createdAt)}</p>
                <p>${esc(m.body)}</p>
                ${
                  m.reply
                    ? `<div class="erp-reply"><strong>Admin reply:</strong> ${esc(m.reply)}<br><span class="meta">${fmtDateTime(m.repliedAt)}</span></div>`
                    : `<p class="erp-muted">${isAdmin() ? "" : "Awaiting reply…"}</p>`
                }
                ${
                  isAdmin()
                    ? `<form class="erp-form reply-form" data-id="${m.id}" style="margin-top:10px">
                         <div class="erp-field"><textarea name="reply" placeholder="Write a reply…">${esc(m.reply || "")}</textarea></div>
                         <div><button class="button button--secondary button--sm" type="submit">${m.reply ? "Update reply" : "Reply"}</button></div>
                       </form>`
                    : ""
                }
              </div>
            </div>`
          )
          .join("")}</div>`
      : `<p class="erp-empty">${isAdmin() ? "No messages yet." : "You haven't sent any messages yet."}</p>`;

    root.innerHTML = composer + list;

    const form = $("#msg-form", root);
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const r = await api("/api/messages", { method: "POST", body: { body: form.body.value.trim() } });
        if (r.success) {
          toast("Message sent");
          render("messages");
        } else toast(r.message || "Failed", "error");
      });
    }
    $$(".reply-form", root).forEach((f) => {
      const btn = f.querySelector("button[type=submit]");
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const reply = f.querySelector("textarea").value.trim();
        if (!reply) {
          toast("Write a reply first", "error");
          return;
        }
        btn.disabled = true;
        try {
          const r = await api("/api/messages/reply", {
            method: "POST",
            body: { id: f.dataset.id, reply },
          });
          if (r.success) {
            toast("Reply sent");
            render("messages");
          } else {
            toast(r.message || "Failed", "error");
            btn.disabled = false;
          }
        } catch (err) {
          if (err.message !== "Not authenticated") toast("Couldn't reach the server", "error");
          btn.disabled = false;
        }
      });
    });
  },
};

/* =========================================================
   Navigation / boot
   ========================================================= */

const TITLES = {
  overview: "Overview",
  announcements: "Announcements",
  events: "Events & Sessions",
  attendance: "Attendance",
  members: "Members",
  messages: "Messages",
};

async function render(view) {
  $("#erp-title").textContent = TITLES[view] || view;
  $$(".erp-nav__item").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
  const root = $("#erp-content");
  try {
    await VIEWS[view](root);
  } catch (err) {
    if (err.message !== "Not authenticated") {
      root.innerHTML = `<p class="erp-empty">Something went wrong loading this section.</p>`;
    }
  }
}

function initNav() {
  $$(".erp-nav__item").forEach((btn) =>
    btn.addEventListener("click", () => {
      render(btn.dataset.view);
      $("#erp-sidebar").classList.remove("is-open"); // close on mobile
    })
  );
  $("#erp-menu-btn").addEventListener("click", () => $("#erp-sidebar").classList.toggle("is-open"));
  $("#erp-logout").addEventListener("click", async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    location.href = "index.html";
  });
}

function gateMessage(html) {
  const gate = $("#erp-gate");
  if (gate) gate.innerHTML = html;
}

async function boot() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    // Not logged in — send them to the site to sign in.
    location.replace("index.html");
    return;
  }

  let result;
  try {
    result = await api("/api/verify", { method: "POST", body: { token } });
  } catch (err) {
    // api() already redirects on 401. Anything else here means the
    // request never completed (server down, or page opened as a file://).
    if (err && err.message === "Not authenticated") return;
    gateMessage(
      `<div style="text-align:center;max-width:420px">
         <p><strong>Couldn't reach the server.</strong></p>
         <p class="erp-muted">Make sure it's running and open this page through
         <code>http://localhost:3000/dashboard.html</code> — not by double-clicking the file.</p>
         <p><button class="button button--secondary button--sm" onclick="location.reload()">Try again</button>
         <a class="button button--primary button--sm" href="index.html">Go to site</a></p>
       </div>`
    );
    return;
  }

  if (!result || !result.success) {
    // Token is stale (e.g. the server restarted and cleared sessions).
    localStorage.removeItem(TOKEN_KEY);
    location.replace("index.html");
    return;
  }

  CURRENT = result.user;
  $("#erp-user-name").textContent = CURRENT.name;
  const roleBadge = $("#erp-user-role");
  roleBadge.textContent = CURRENT.role;
  roleBadge.classList.toggle("is-admin", isAdmin());

  // Hide admin-only nav items for members.
  if (!isAdmin()) $$(".erp-nav__item[data-admin]").forEach((b) => (b.hidden = true));

  $("#erp-gate").hidden = true;
  $("#erp-shell").hidden = false;

  initNav();
  render("overview");
}

document.addEventListener("DOMContentLoaded", boot);
