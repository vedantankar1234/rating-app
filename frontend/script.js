// ===================== Example Data (Preloaded) =====================
if (!localStorage.getItem("users")) {
  const users = [
    {name: "Admin Example User", email: "admin@example.com", address: "Admin Address", password: "Admin@123", role: "admin"},
    {name: "Normal Example User", email: "user@example.com", address: "User Address", password: "User@1234", role: "user"},
    {name: "Store Owner Example", email: "owner@example.com", address: "Owner Address", password: "Owner@123", role: "owner"}
  ];
  localStorage.setItem("users", JSON.stringify(users));
}

if (!localStorage.getItem("stores")) {
  const stores = [
    {id: "s1", name: "SuperMart", address: "123 Market St", email: "supermart@example.com", ownerEmail: "owner@example.com"},
    {id: "s2", name: "FreshFoods", address: "456 Grocery Rd", email: "freshfoods@example.com", ownerEmail: "owner@example.com"}
  ];
  localStorage.setItem("stores", JSON.stringify(stores));
}

if (!localStorage.getItem("ratings")) {
  const ratings = [
    {storeId: "s1", userEmail: "user@example.com", rating: 4},
    {storeId: "s2", userEmail: "user@example.com", rating: 5}
  ];
  localStorage.setItem("ratings", JSON.stringify(ratings));
}

// ===================== Helper Functions =====================
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}
// ===================== API Helper =====================
async function fetchUsersFromAPI() {
  try {
    const res = await fetch("http://localhost:5000/auth/users"); // backend endpoint
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ===================== Signup =====================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    // simple validation
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      // 🔥 Send data to backend API
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, address, password, role })
      });

      if (res.ok) {
        alert("Signup successful! Please login.");
        window.location.href = "index.html"; // redirect to login page
      } else {
        const msg = await res.text();
        alert("Error: " + msg);
      }
    } catch (err) {
      console.error("Error during signup:", err);
      alert("Something went wrong. Please try again.");
    }
  });
}

// ===================== Login (with backend) =====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Call backend API
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save logged in user in localStorage
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "user") {
          window.location.href = "store-list.html";
        } else if (data.user.role === "owner") {
          window.location.href = "owner-dashboard.html";
        } else if (data.user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        }
      } else {
        alert(data.message || "Invalid email or password!");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Please try again later.");
    }
  });
}

//================================== Admin Dashboard =========================================//

async function loadAdminDashboard() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser || loggedInUser.role !== "admin") {
    alert("Access denied!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeText").innerText = `Welcome, ${loggedInUser.name}!`;

  try {
    // 🔹 Fetch statistics
    const statsRes = await fetch("http://localhost:5000/auth/stats");
    const stats = await statsRes.json();
    console.log("Stats from backend:", stats); // Debug in console

    document.getElementById("totalUsers").innerText =
      stats.totalUsers || stats.totalusers || 0;
    document.getElementById("totalStores").innerText =
      stats.totalStores || stats.totalstores || 0;
    document.getElementById("totalRatings").innerText =
      stats.totalRatings || stats.totalratings || 0;

    // 🔹 Fetch users
    const usersRes = await fetch("http://localhost:5000/auth/users");
    const users = await usersRes.json();
    const usersTable = document.getElementById("usersTable");
    usersTable.innerHTML = "";
    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>`;
      usersTable.appendChild(tr);
    });

   // Populate owner dropdown
const ownerSelect = document.getElementById("storeOwnerSelect");
if (ownerSelect) {
  ownerSelect.innerHTML = '<option value="">Select owner</option>';

  users
    .filter(u => u.role === "owner")
    .forEach(o => {
      const option = document.createElement("option");
      option.value = o.id;
      option.textContent = `${o.name} (${o.email})`;
      ownerSelect.appendChild(option);
    });
}

// 🔹 Handle Add Store form
const addStoreForm = document.getElementById("addStoreForm");
if (addStoreForm) {
  addStoreForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("newStoreName").value.trim();
    const address = document.getElementById("newStoreAddress").value.trim();
    const owner_id = document.getElementById("storeOwnerSelect").value;

    if (!name || !address || !owner_id) {
      alert("Fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, owner_id })
      });

      if (res.ok) {
        alert("Store added!");
        addStoreForm.reset();
        await loadAdminDashboard(); // refresh stats + tables
      } else {
        const text = await res.text();
        alert("Error: " + text);
      }
    } catch (err) {
      console.error("Add store error:", err);
      alert("Server error");
    }
  });
}

    
    // 🔹 Fetch stores
    const storesRes = await fetch("http://localhost:5000/auth/stores");
    const stores = await storesRes.json();
    const storesTable = document.getElementById("storesTable");
    storesTable.innerHTML = "";
    stores.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.address}</td><td>${s.owner_id}</td>`;
      storesTable.appendChild(tr);
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    alert("Failed to load dashboard");
  }
}

if (document.getElementById("welcomeText")) {
  loadAdminDashboard();
}

// ===================== Normal User Store List =====================
function loadUserStores() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser || loggedInUser.role !== "user") { alert("Access denied!"); window.location.href = "index.html"; return; }

  document.getElementById("welcomeTextUser").innerText = `Welcome, ${loggedInUser.name}!`;
  let stores = JSON.parse(localStorage.getItem("stores") || "[]");
  let ratings = JSON.parse(localStorage.getItem("ratings") || "[]");
  const storeTable = document.getElementById("storeTable");
  storeTable.innerHTML = "";

  stores.forEach(store => {
    const storeRatings = ratings.filter(r => r.storeId === store.id);
    const avgRating = storeRatings.length ? (storeRatings.reduce((sum,r)=>sum+r.rating,0)/storeRatings.length).toFixed(2) : 0;
    const userRatingObj = storeRatings.find(r => r.userEmail === loggedInUser.email);
    const userRating = userRatingObj ? userRatingObj.rating : '';

    const tr = document.createElement("tr");
   tr.innerHTML = `
  <td>${store.name}</td>
  <td>${store.address}</td>
  <td>${avgRating}</td>
  <td>${userRating}</td>
  <td>
    <input type="number" min="1" max="5" id="rate-${store.id}" value="${userRating}">
    <button onclick="submitRating(${store.id})">Submit</button>
  </td>`

    storeTable.appendChild(tr);
  });
}

async function submitRating(storeId) {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const ratingInput = document.getElementById(`rate-${storeId}`);
  const ratingValue = parseInt(ratingInput.value);

  if (ratingValue < 1 || ratingValue > 5 || isNaN(ratingValue)) {
    alert("Rating must be between 1 and 5");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/auth/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(loggedInUser.id),
        store_id: parseInt(storeId),
        rating: parseInt(ratingValue),
      }),
    });

    if (res.ok) {
      alert("Rating submitted!");
      loadUserStores(); // refresh the list with updated ratings
    } else {
      alert("Failed to submit rating");
    }
  } catch (err) {
    console.error("Submit rating error:", err);
    alert("Error submitting rating");
  }
}

function searchStores() {
  const query = document.getElementById("searchStore").value.toLowerCase();
  const rows = document.querySelectorAll("#storeTable tr");
  rows.forEach(row => { row.style.display = row.innerText.toLowerCase().includes(query) ? "" : "none"; });
}

if (document.getElementById("storeTable")) { loadUserStores(); }

// ===================== Store Owner Dashboard =====================
function loadOwnerDashboard() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser || loggedInUser.role !== "owner") { alert("Access denied!"); window.location.href = "index.html"; return; }

  document.getElementById("welcomeTextOwner").innerText = `Welcome, ${loggedInUser.name}!`;
  const stores = JSON.parse(localStorage.getItem("stores") || "[]");
  const ratings = JSON.parse(localStorage.getItem("ratings") || "[]");
  const users = getUsers();

  const ownerStore = stores.find(s => s.ownerEmail === loggedInUser.email);
  if (!ownerStore) { document.getElementById("storeInfo").innerText = "No store assigned"; return; }

  const storeRatings = ratings.filter(r => r.storeId === ownerStore.id);
  const avgRating = storeRatings.length ? (storeRatings.reduce((sum,r)=>sum+r.rating,0)/storeRatings.length).toFixed(2) : 0;
  document.getElementById("storeInfo").innerText = `Store: ${ownerStore.name}, Address: ${ownerStore.address}, Average Rating: ${avgRating}`;

  const ratingsTable = document.getElementById("ratingsTable");
  ratingsTable.innerHTML = "";
  storeRatings.forEach(r => {
    const user = users.find(u => u.email === r.userEmail);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${user ? user.name : r.userEmail}</td><td>${r.userEmail}</td><td>${r.rating}</td>`;
    ratingsTable.appendChild(tr);
  });
}

if (document.getElementById("welcomeTextOwner")) { loadOwnerDashboard(); }
