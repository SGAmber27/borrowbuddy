/**
 * Borrow Buddy Student Profile JavaScript
 * Handles profile display, editing, and activity tracking
 */

// ==========================================
// GLOBAL VARIABLES
// ==========================================

// Current user data - loaded async
let currentUser = null;


// ==========================================
// PROFILE MANAGEMENT
// ==========================================

/**
 * Load and display user profile information
 * Updates all profile sections with current user data
 */
async function loadProfile() {
  // Update header information
  document.getElementById("displayName").textContent = currentUser.firstName + " " + currentUser.lastName;
  document.getElementById("displayEmail").textContent = currentUser.email;

  // Update account information section
  document.getElementById("accountInfo").innerHTML = `
    <div class="info-item">
      <div class="info-label">Email</div>
      <div class="info-value">${currentUser.email}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Phone</div>
      <div class="info-value">${currentUser.phone || "N/A"}</div>
    </div>
  `;

  // Populate edit form with current values
  document.getElementById("editFirst").value = currentUser.firstName;
  document.getElementById("editLast").value = currentUser.lastName;
  document.getElementById("editEmail").value = currentUser.email;
  document.getElementById("editPhone").value = currentUser.phone || "";

  // Load statistics and activity
  await loadStats();
  await loadActivity();
}

/**
 * Load and display user statistics
 * Shows total requests, approved requests, pending requests, grade, and section
 */
async function loadStats() {
  const requests = await getRequestsAsync();
  const myReq = requests.filter(r => r.studentEmail === currentUser.email);

  // Calculate statistics
  const approved = myReq.filter(r => r.status === "Approved").length;
  const pending = myReq.filter(r => r.status === "Pending").length;

  // Get latest grade and section from user's requests
  const latestRequest = myReq.sort((a, b) =>
    new Date(b.requestedAt || b.requestDate) - new Date(a.requestedAt || a.requestDate)
  )[0];
  const grade = latestRequest?.studentGrade || "N/A";
  const section = latestRequest?.studentSection || "N/A";

  // Update stats display
  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-card"><h2>${myReq.length}</h2><p>Total Requests</p></div>
    <div class="stat-card"><h2>${approved}</h2><p>Approved</p></div>
    <div class="stat-card"><h2>${pending}</h2><p>Pending</p></div>
    <div class="stat-card"><h2>${grade}</h2><p>Grade</p></div>
    <div class="stat-card"><h2>${section}</h2><p>Section</p></div>
  `;
}

/**
 * Load and display user activity
 * Shows a list of all borrow requests with their current status
 */
async function loadActivity() {
  const requests = await getRequestsAsync();
  const myReq = requests.filter(r => r.studentEmail === currentUser.email);

  const activityList = document.getElementById("activityList");
  activityList.innerHTML = myReq.length
    ? myReq.map(r => `<p>📦 ${r.itemName} — <b>${r.status}</b></p>`).join("")
    : "<p>No activity yet.</p>";
}

/**
 * Save profile changes
 * Updates user information and refreshes the display
 * @param {Event} e - Form submit event
 */
async function saveProfile(e) {
  e.preventDefault();

  const firstName = document.getElementById("editFirst").value;
  const lastName = document.getElementById("editLast").value;
  const phone = document.getElementById("editPhone").value;

  const profileData = {
    firstName,
    lastName,
    phone,
    updated_at: new Date().toISOString()
  };

  const success = await window.saveProfileAsync(profileData);
  if (success) {
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.phone = phone;
    await loadProfile();
  }
}


// ==========================================
// NAVIGATION
// ==========================================

/**
 * Switch between profile tabs
 * @param {string} id - ID of the tab content to show
 * @param {HTMLElement} el - The clicked tab button element
 */
function switchTab(id, el) {
  // Hide all sections
  document.querySelectorAll(".profile-section").forEach(s => s.classList.remove("active"));

  // Remove active class from all tabs
  document.querySelectorAll(".profile-tab").forEach(t => t.classList.remove("active"));

  // Show selected section and activate tab
  document.getElementById(id).classList.add("active");
  el.classList.add("active");
}

/**
 * Navigate back to student dashboard
 */
function goBack() {
  window.location.href = "student.html";
}

/**
 * Logout user and redirect to login page
 */
function logout() {
  window.logout();
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initSupabase();
  currentUser = await window.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }
  await loadProfile();
});
