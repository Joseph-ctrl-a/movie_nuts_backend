/* ======================================================
   COMMUNITY PAGE SCRIPT
   - Matches browse behavior
   - Clickable profile → profile.html?id=USER_ID
   - No navbar conflicts
   ====================================================== */

const USERS_API = "http://localhost:5000/api/users";

// DOM elements (names chosen to avoid search.js conflicts)
const userGrid = document.getElementById("user-grid");
const userSearchInput = document.getElementById("user-search");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pageLabel = document.getElementById("page-display");
const pageInput = document.getElementById("page-input");
const pageGoButton = document.getElementById("page-go");

let allUsers = [];
let visibleUsers = [];
let currentPage = 1;
const USERS_PER_PAGE = 8;

/* ---------------- FETCH USERS ---------------- */
async function loadUsers() {
    try {
        const res = await fetch(USERS_API);
        if (!res.ok) throw new Error("Failed to fetch users");

        allUsers = await res.json();
        visibleUsers = allUsers;
        renderUsers();
    } catch (err) {
        console.error(err);
        userGrid.innerHTML = "<p>Could not load users.</p>";
    }
}

/* ---------------- RENDER USERS ---------------- */
function renderUsers() {
    userGrid.innerHTML = "";

    const totalPages = Math.max(
        1,
        Math.ceil(visibleUsers.length / USERS_PER_PAGE)
    );

    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * USERS_PER_PAGE;
    const pageUsers = visibleUsers.slice(start, start + USERS_PER_PAGE);

    pageUsers.forEach(user => {
        const card = document.createElement("div");
        card.className = "user-card";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            window.location.href = `profile.html?id=${user._id}`;
        });

        const ring = document.createElement("div");
        ring.className = "user-ring";

        if (user.profilePicture) {
            const img = document.createElement("img");
            img.src = user.profilePicture;
            img.alt = user.username;
            ring.appendChild(img);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "user-placeholder";
            placeholder.innerHTML = "No Profile<br>Picture";
            ring.appendChild(placeholder);
        }

        const username = document.createElement("div");
        username.className = "username";
        username.textContent = user.username;

        card.appendChild(ring);
        card.appendChild(username);
        userGrid.appendChild(card);
    });

    pageLabel.textContent = `Page ${currentPage}/${totalPages}`;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

/* ---------------- SEARCH ---------------- */
userSearchInput.addEventListener("input", () => {
    const term = userSearchInput.value.trim().toLowerCase();

    visibleUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(term)
    );

    currentPage = 1;
    renderUsers();
});

/* ---------------- PAGINATION ---------------- */
prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderUsers();
    }
});

nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(visibleUsers.length / USERS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderUsers();
    }
});

pageGoButton.addEventListener("click", () => {
    const page = parseInt(pageInput.value, 10);
    const totalPages = Math.ceil(visibleUsers.length / USERS_PER_PAGE);

    if (!isNaN(page) && page >= 1 && page <= totalPages) {
        currentPage = page;
        renderUsers();
    }
});

/* ---------------- INIT ---------------- */
loadUsers();
