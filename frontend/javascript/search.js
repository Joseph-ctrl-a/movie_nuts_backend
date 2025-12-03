// frontend/javascript/search.js

const searchInput = document.getElementById("nav-search");
const searchResults = document.getElementById("search-results");

function clearResults() {
  if (!searchResults) return;
  searchResults.innerHTML = "";
  searchResults.style.display = "none";
}

async function runSearch() {
  if (!searchInput || !searchResults) return;

  const query = searchInput.value.trim();

  if (!query) {
    clearResults();
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5000/api/movies/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      console.error("Search request failed:", res.status);
      clearResults();
      return;
    }

    const movies = await res.json();
    renderSearchResults(movies);
  } catch (err) {
    console.error("Search error:", err);
    clearResults();
  }
}

function renderSearchResults(movies) {
  if (!searchResults) return;

  if (!movies || movies.length === 0) {
    clearResults();
    return;
  }

  // Clear existing results
  searchResults.innerHTML = "";

  // Only show top 5
  movies.slice(0, 5).forEach((movie) => {
    const item = document.createElement("div");
    item.className = "search-dropdown-item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    const posterPath = movie.posterPath || movie.poster_path || "";
    const img = document.createElement("img");
    img.src = posterPath
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : "https://via.placeholder.com/92x138?text=No+Image";
    img.alt = `Poster for ${movie.title || movie.name || "film"}`;

    const titleSpan = document.createElement("span");
    titleSpan.textContent = movie.title || movie.name || "Untitled film";

    item.appendChild(img);
    item.appendChild(titleSpan);

    // When clicked: store movie and go to film.html
    const goToFilm = () => {
      try {
        localStorage.setItem("selectedMovie", JSON.stringify(movie));
      } catch (e) {
        console.warn("Could not store movie in localStorage:", e);
      }
      window.location.href = "film.html";
    };

    item.addEventListener("click", goToFilm);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToFilm();
      }
    });

    searchResults.appendChild(item);
  });

  // SHOW the dropdown
  searchResults.style.display = "block";
}

// Debounced input handler
if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(window.searchDebounce);
    window.searchDebounce = setTimeout(runSearch, 300);
  });
}

// Optional: hide results when clicking outside
document.addEventListener("click", (e) => {
  if (
    searchResults &&
    !searchResults.contains(e.target) &&
    e.target !== searchInput
  ) {
    clearResults();
  }
});

