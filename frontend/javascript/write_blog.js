// write_blog.js

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     AUTH CHECK
  ========================= */

  const token = localStorage.getItem("movieNuts:token");

  if (!token) {
    alert("You must be logged in to write a blog.");
    window.location.href = "login.html";
    return;
  }

  /* =========================
     ELEMENT REFERENCES
  ========================= */

  const filmSearchInput = document.getElementById("film-search-input");
  const searchResults = document.getElementById("film-search-results");
  const posterEl = document.getElementById("chosen-film-poster");
  const placeholderEl = document.querySelector(".poster-placeholder");

  const blogTitleEl = document.getElementById("blog-title");
  const blogBodyEl = document.getElementById("blog-body");
  const submitBtn = document.getElementById("submit-blog");

  const ratingContainer = document.getElementById("user-rating-input");

  let selectedFilm = null;
  let selectedRating = 0;

  /* =========================
     PREFILL FILM (optional)
  ========================= */

  (function loadPrefilledFilm() {
    const raw = localStorage.getItem("movieNuts:prefillFilm");
    if (!raw) return;

    try {
      const film = JSON.parse(raw);
      selectedFilm = film;
      filmSearchInput.value = film.title || "";

      if (film.posterSrc) {
        posterEl.src = film.posterSrc;
        posterEl.style.display = "block";
        placeholderEl.style.display = "none";
      }
    } catch (err) {
      console.error("Failed to load prefilled film:", err);
    }

    localStorage.removeItem("movieNuts:prefillFilm");
  })();

  /* =========================
     MOVIE SEARCH
  ========================= */

  async function runSearch() {
    const query = filmSearchInput.value.trim();
    if (!query) {
      searchResults.style.display = "none";
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/movies/search?q=${encodeURIComponent(query)}`
      );

      const movies = await res.json();
      renderSearchResults(movies);
    } catch (err) {
      console.error("Movie search failed:", err);
    }
  }

  function renderSearchResults(movies) {
    searchResults.innerHTML = "";
    if (!movies.length) {
      searchResults.style.display = "none";
      return;
    }

    movies.slice(0, 7).forEach(movie => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.textContent = movie.title || movie.name;
      item.addEventListener("click", () => chooseFilm(movie));
      searchResults.appendChild(item);
    });

    searchResults.style.display = "block";
  }

  function chooseFilm(movie) {
    selectedFilm = movie;
    filmSearchInput.value = movie.title || movie.name;
    searchResults.style.display = "none";

    const posterPath = movie.poster_path || movie.posterPath;

    if (posterPath) {
      posterEl.src = `https://image.tmdb.org/t/p/w780${posterPath}`;
      posterEl.onload = () => {
        posterEl.style.display = "block";
        placeholderEl.style.display = "none";
      };
    } else {
      posterEl.style.display = "none";
      placeholderEl.style.display = "flex";
    }
  }

  filmSearchInput.addEventListener("input", () => {
    clearTimeout(window._filmSearchDebounce);
    window._filmSearchDebounce = setTimeout(runSearch, 250);
  });

  /* =========================
     RATING INPUT
  ========================= */

  function applyRatingVisual(rating) {
    const wrappers = ratingContainer.querySelectorAll(".acorn-wrapper");

    wrappers.forEach((wrapper, index) => {
      const acornNum = index + 1;
      const visual = wrapper.querySelector(".acorn-visual");

      visual.classList.remove("full", "half", "empty");

      if (rating >= acornNum) visual.classList.add("full");
      else if (rating >= acornNum - 0.5) visual.classList.add("half");
      else visual.classList.add("empty");
    });
  }

  applyRatingVisual(0);

  ratingContainer.addEventListener("mouseover", e => {
    const half = e.target.closest(".left-half, .right-half");
    if (!half) return;
    applyRatingVisual(parseFloat(half.dataset.value));
  });

  ratingContainer.addEventListener("click", e => {
    const half = e.target.closest(".left-half, .right-half");
    if (!half) return;
    selectedRating = parseFloat(half.dataset.value);
    applyRatingVisual(selectedRating);
  });

  ratingContainer.addEventListener("mouseleave", () => {
    applyRatingVisual(selectedRating);
  });

  /* =========================
     SUBMIT BLOG
  ========================= */

  submitBtn.addEventListener("click", async () => {
    const title = blogTitleEl.value.trim();
    const body = blogBodyEl.value.trim();

    if (!selectedFilm) return alert("Choose a film first.");
    if (!title) return alert("Enter a blog title.");
    if (!selectedRating) return alert("Give a rating.");
    if (!body) return alert("Write your blog content.");

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          film: selectedFilm,
          rating: selectedRating,
          title,
          body
        })
      });

      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("movieNuts:token");
        window.location.href = "login.html";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to save blog");
      }

      const savedBlog = await res.json();
      window.location.href = `blog.html?id=${savedBlog._id}`;

    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving your blog.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Blog";
    }
  });
});
