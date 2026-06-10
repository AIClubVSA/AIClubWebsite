// Session management
let currentUser = null;
let sessionToken = localStorage.getItem("sessionToken");

// Check if already logged in on page load
document.addEventListener("DOMContentLoaded", () => {
  if (sessionToken) {
    verifySession();
  }
});

// VERIFY SESSION
async function verifySession() {
  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sessionToken })
    });

    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
      showDashboard();
    } else {
      localStorage.removeItem("sessionToken");
      showAuth();
    }
  } catch (error) {
    console.error("Session verification failed:", error);
    showAuth();
  }
}

// HANDLE SIGNUP
async function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const msgEl = document.getElementById("signupMsg");

  msgEl.textContent = "";
  msgEl.className = "message";

  if (!name || !email || !password) {
    msgEl.textContent = "All fields are required";
    msgEl.className = "message error";
    return;
  }

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
      sessionToken = data.token;
      localStorage.setItem("sessionToken", sessionToken);
      msgEl.textContent = "Account created! Redirecting...";
      msgEl.className = "message success";
      setTimeout(showDashboard, 1000);
    } else {
      msgEl.textContent = data.message;
      msgEl.className = "message error";
    }
  } catch (error) {
    msgEl.textContent = "Signup failed. Please try again.";
    msgEl.className = "message error";
    console.error(error);
  }
}

// HANDLE LOGIN
async function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msgEl = document.getElementById("loginMsg");

  msgEl.textContent = "";
  msgEl.className = "message";

  if (!email || !password) {
    msgEl.textContent = "Email and password are required";
    msgEl.className = "message error";
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
      sessionToken = data.token;
      localStorage.setItem("sessionToken", sessionToken);
      msgEl.textContent = "Login successful! Redirecting...";
      msgEl.className = "message success";
      setTimeout(showDashboard, 1000);
    } else {
      msgEl.textContent = data.message;
      msgEl.className = "message error";
    }
  } catch (error) {
    msgEl.textContent = "Login failed. Please try again.";
    msgEl.className = "message error";
    console.error(error);
  }
}

// HANDLE LOGOUT
async function handleLogout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sessionToken })
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  currentUser = null;
  sessionToken = null;
  localStorage.removeItem("sessionToken");
  showAuth();
  switchToSignup();
}

// SWITCH TO LOGIN FORM
function switchToLogin() {
  document.getElementById("signupForm").classList.remove("visible");
  document.getElementById("loginForm").classList.add("visible");
  clearForms();
}

// SWITCH TO SIGNUP FORM
function switchToSignup() {
  document.getElementById("loginForm").classList.remove("visible");
  document.getElementById("signupForm").classList.add("visible");
  clearForms();
}

// CLEAR FORM INPUTS
function clearForms() {
  document.getElementById("signupName").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("signupMsg").textContent = "";
  document.getElementById("loginMsg").textContent = "";
}

// SHOW AUTH CONTAINER
function showAuth() {
  document.getElementById("authContainer").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("hidden");
}

// SHOW DASHBOARD
function showDashboard() {
  document.getElementById("authContainer").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  
  if (currentUser) {
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("welcomeMessage").textContent = 
      `We're glad to have ${currentUser.name} back! Let's explore AI together.`;
  }
}