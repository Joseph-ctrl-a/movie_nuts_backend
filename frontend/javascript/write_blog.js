// write_blog.js

document.addEventListener("DOMContentLoaded", () => {
  /*ELEMENT REFERENCES*/
  const filmSearchInput = document.getElementById("film-search-input");
  const searchResults = document.getElementById("film-search-results");
  const posterEl = document.getElementById("chosen-film-poster");
  const placeholderEl = document.querySelector(".poster-placeholder");

  const blogTitleEl = document.getElementById("blog-title");
  const blogBodyEl = document.getElementById("blog-body");

  const ratingContainer = document.getElementById("user-rating-input");

  let selectedFilm = null;     // film object the user selected
  let selectedRating = 0;      // 0 → 5 in 0.5 steps




  /*PREFILL FILM IF COMING FROM film.html*/
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

    // Clear it so it doesn’t autofill next time
    localStorage.removeItem("movieNuts:prefillFilm");
  })();




  /*MOVIE SEARCH (for manual selection)*/

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
      console.error("Search failed:", err);
    }
  }

  function renderSearchResults(movies) {
    searchResults.innerHTML = "";
    if (!movies.length) {
      searchResults.style.display = "none";
      return;
    }

    movies.slice(0, 7).forEach((movie) => {
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
    searchResults.style.display = "none";
    filmSearchInput.value = movie.title || movie.name;

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




  /*HALF-ACORN RATING INPUT*/

  function applyRatingVisual(rating) {
    const wrappers = ratingContainer.querySelectorAll(".acorn-wrapper");

    wrappers.forEach((wrapper, index) => {
      const acornNumber = index + 1; // 1–5
      const visual = wrapper.querySelector(".acorn-visual");

      visual.classList.remove("full", "half", "empty");

      if (rating >= acornNumber) {
        visual.classList.add("full");
      } else if (rating >= acornNumber - 0.5) {
        visual.classList.add("half");
      } else {
        visual.classList.add("empty");
      }
    });
  }

  // Start empty
  applyRatingVisual(0);

  // Hover preview
  ratingContainer.addEventListener("mouseover", (e) => {
    const half = e.target.closest(".left-half, .right-half");
    if (!half) return;
    applyRatingVisual(parseFloat(half.dataset.value));
  });

  // Click to set rating
  ratingContainer.addEventListener("click", (e) => {
    const half = e.target.closest(".left-half, .right-half");
    if (!half) return;
    selectedRating = parseFloat(half.dataset.value);
    applyRatingVisual(selectedRating);
  });

  // Leave → snap back to chosen value
  ratingContainer.addEventListener("mouseleave", () => {
    applyRatingVisual(selectedRating);
  });




  /*SUBMIT BLOG*/

  document.getElementById("submit-blog").addEventListener("click", () => {
    const title = blogTitleEl.value.trim();
    const body = blogBodyEl.value.trim();

    if (!selectedFilm) {
      alert("Choose a film first!");
      return;
    }

    if (!title) {
      alert("Enter a blog title.");
      return;
    }

    if (!selectedRating) {
      alert("Give a rating.");
      return;
    }

    if (!body) {
      alert("Write your blog content.");
      return;
    }

    const data = {
      film: selectedFilm,
      rating: selectedRating,
      title,
      body,
      createdAt: new Date().toISOString(),
    };

    console.log("Blog ready to save:", data);

    alert("Blog created! (Backend integration coming soon)");
  });

});