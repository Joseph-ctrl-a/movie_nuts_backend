document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:5000";

  const grid = document.getElementById("reviewsGrid");
  const statusText = document.getElementById("statusText");
  const pageTitle = document.getElementById("pageTitle");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");
  const goInput = document.getElementById("goInput");
  const goBtn = document.getElementById("goBtn");

  const modalOverlay = document.getElementById("modalOverlay");
  const closeModalBtn = document.getElementById("closeModal");
  const modalPoster = document.getElementById("modalPoster");
  const modalPosterPlaceholder = document.getElementById("modalPosterPlaceholder");
  const modalFilmTitle = document.getElementById("modalFilmTitle");
  const modalRating = document.getElementById("modalRating");
  const modalReviewTitle = document.getElementById("modalReviewTitle");
  const modalReviewBody = document.getElementById("modalReviewBody");

  let currentPage = 1;
  let totalPages = 1;
  const LIMIT = 10;

  /* ------------------ AUTH ------------------ */
  function getToken() {
    return localStorage.getItem("movieNuts:token");
  }

  function getUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  const params = new URLSearchParams(window.location.search);
  const profileUserId = params.get("userId");

  let activeUserId;

  if (profileUserId) {
  // Viewing someone else's reviews → PUBLIC
  activeUserId = profileUserId;
  pageTitle.textContent = "User Reviews";
} else {
  // Viewing own reviews → LOGIN REQUIRED
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  activeUserId = getUserIdFromToken(token);
  if (!activeUserId) {
    window.location.href = "login.html";
    return;
  }

  pageTitle.textContent = "My Reviews";
}


  /* ------------------ ACORNS ------------------ */
  function renderAcorns(rating) {
    const container = document.createElement("div");
    container.className = "acorn-mini-rating";

    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;

    for (let i = 0; i < full; i++) {
      const a = document.createElement("span");
      a.className = "acorn-mini full";
      container.appendChild(a);
    }

    if (half) {
      const a = document.createElement("span");
      a.className = "acorn-mini half";
      container.appendChild(a);
    }

    for (let i = 0; i < empty; i++) {
      const a = document.createElement("span");
      a.className = "acorn-mini empty";
      container.appendChild(a);
    }

    return container;
  }

  /* ------------------ FETCH ------------------ */
  async function fetchReviews() {
    statusText.textContent = "Loading reviews...";
    grid.innerHTML = "";

    const res = await fetch(
      `${API}/api/blogs/user/${activeUserId}?page=${currentPage}&limit=${LIMIT}`
    );

    const data = await res.json();
    totalPages = data.totalPages;

    renderReviews(data.blogs);
    updatePagination();
  }

  /* ------------------ RENDER ------------------ */
  function renderReviews(blogs) {
    if (!blogs.length) {
      statusText.textContent = "No reviews found.";
      return;
    }

    statusText.textContent = "";

    blogs.forEach(blog => {
      const card = document.createElement("div");
      card.className = "review-card";

      const posterWrap = document.createElement("div");
      posterWrap.className = "review-poster-wrap";

      if (blog.film.posterPath) {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w300${blog.film.posterPath}`;
        img.className = "review-poster";
        posterWrap.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "review-poster placeholder";
        ph.textContent = "Sorry!! No poster available";
        posterWrap.appendChild(ph);
      }

      const info = document.createElement("div");
      info.className = "review-info";

      const title = document.createElement("h3");
      title.textContent = blog.film.title;

      const rating = renderAcorns(blog.rating);

      const preview = document.createElement("p");
      preview.textContent = blog.body.slice(0, 140) + "...";

      info.append(title, rating, preview);
      card.append(posterWrap, info);

      card.addEventListener("click", () => openModal(blog));
      grid.appendChild(card);
    });
  }

  /* ------------------ MODAL ------------------ */
  function openModal(blog) {
    modalFilmTitle.textContent = blog.film.title;
    modalReviewTitle.textContent = blog.title;
    modalReviewBody.textContent = blog.body;

    modalRating.innerHTML = "";
    modalRating.appendChild(renderAcorns(blog.rating));

    if (blog.film.posterPath) {
      modalPoster.src = `https://image.tmdb.org/t/p/w500${blog.film.posterPath}`;
      modalPoster.classList.remove("hidden");
      modalPosterPlaceholder.classList.add("hidden");
    } else {
      modalPoster.classList.add("hidden");
      modalPosterPlaceholder.classList.remove("hidden");
    }

    modalOverlay.classList.remove("hidden");
  }

  closeModalBtn.onclick = () => modalOverlay.classList.add("hidden");
  modalOverlay.onclick = e => e.target === modalOverlay && modalOverlay.classList.add("hidden");

  /* ------------------ PAGINATION ------------------ */
  function updatePagination() {
    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    goInput.value = currentPage;
  }

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchReviews();
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchReviews();
    }
  };

  goBtn.onclick = () => {
    const n = parseInt(goInput.value);
    if (n >= 1 && n <= totalPages) {
      currentPage = n;
      fetchReviews();
    }
  };

  fetchReviews();
});
