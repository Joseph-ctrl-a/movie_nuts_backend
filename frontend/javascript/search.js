// frontend/javascript/search.js

const searchInput = document.getElementById("nav-search");
const searchResults = document.getElementById("search-results");

function clearResults() {
  searchResults.innerHTML = "";
  searchResults.style.display = "none";
}

async function runSearch() {
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
  if (!movies || movies.length === 0) {
    clearResults();
    return;
  }

  // Build the HTML for the top 5 results
  searchResults.innerHTML = movies
    .slice(0, 5)
    .map(
      (m) => `
      <div class="search-dropdown-item">
        <img src="https://image.tmdb.org/t/p/w92${m.posterPath}" alt="poster">
        <span>${m.title}</span>
      </div>
    `
    )
    .join("");

  // SHOW the dropdown
  searchResults.style.display = "block";
}

// Debounced input handler
searchInput.addEventListener("input", () => {
  clearTimeout(window.searchDebounce);
  window.searchDebounce = setTimeout(runSearch, 300);
});

// Optional: hide results when clicking outside
document.addEventListener("click", (e) => {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    clearResults();
  }
});
