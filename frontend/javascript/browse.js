document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------
      ELEMENT REFERENCES
  --------------------------------------------------------- */
  const grid = document.getElementById("film-grid");
  const prevBtn = document.getElementById("page-prev");
  const nextBtn = document.getElementById("page-next");
  const pageInfo = document.getElementById("page-info");
  const sortToggle = document.getElementById("sort-toggle");
  const pageInput = document.getElementById("page-input");
  const pageGo = document.getElementById("page-go");
  const loadingMsg = document.getElementById("loading-message");

  /* ---------------------------------------------------------
      STATE
  --------------------------------------------------------- */
  const PAGE_SIZE = 25;
  let films = [];
  let sortedFilms = [];
  let page = 0;
  let sortMode = "popularity";
  let loadingInterval = null;

  const params = new URLSearchParams(window.location.search);
  const filterGenre = params.get("genre");


  /* ---------------------------------------------------------
      LOADING ANIMATION
  --------------------------------------------------------- */
  function startLoadingAnimation() {
    if (!loadingMsg) return;

    let dots = 1;
    loadingMsg.style.display = "block";
    loadingMsg.textContent = "Loading.";

    loadingInterval = setInterval(() => {
      dots = dots === 3 ? 1 : dots + 1;
      loadingMsg.textContent = "Loading" + ".".repeat(dots);
    }, 350);
  }

  function stopLoadingAnimation() {
    if (!loadingMsg) return;

    clearInterval(loadingInterval);
    loadingMsg.style.display = "none";
  }


  /* ---------------------------------------------------------
      LOAD MOVIES
  --------------------------------------------------------- */
  async function loadFilms() {
    try {
      startLoadingAnimation();

      const res = await fetch("http://localhost:5000/api/movies");
      films = await res.json();

      if (filterGenre) {
        films = films.filter(
          f => f.genres && f.genres.includes(filterGenre)
        );
        document.querySelector(".browse-title").textContent =
          `Genre: ${filterGenre}`;
      }

      applySort();
      stopLoadingAnimation();
      renderPage();

    } catch (err) {
      console.error("Error loading films:", err);
      stopLoadingAnimation();
      if (loadingMsg) loadingMsg.textContent = "Failed to load movies.";
    }
  }


  /* ---------------------------------------------------------
      SORTING
  --------------------------------------------------------- */
  function applySort() {
    sortedFilms = [...films];

    if (sortMode === "popularity") {
      sortedFilms.sort((a, b) => {
        const popA = a.popularity || 0;
        const popB = b.popularity || 0;

        // Popularity first, then rating if needed
        if (popA !== popB) return popB - popA;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      sortedFilms.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }

    page = 0;
  }


  /* ---------------------------------------------------------
      RENDER MOVIES FOR CURRENT PAGE
  --------------------------------------------------------- */
  function renderPage() {
    grid.innerHTML = "";

    const totalPages = Math.ceil(sortedFilms.length / PAGE_SIZE);
    const start = page * PAGE_SIZE;
    const items = sortedFilms.slice(start, start + PAGE_SIZE);

    items.forEach(movie => {
      const item = document.createElement("div");
      item.className = "film-item";

      const posterBox = document.createElement("div");
      posterBox.className = "poster-box";

      const poster = movie.posterPath || movie.poster_path;

      if (poster) {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w342${poster}`;
        img.alt = movie.title || "Poster";
        posterBox.appendChild(img);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "poster-placeholder";
        fallback.innerHTML = `
          <p>Sorry!!</p>
          <p>No poster<br>available</p>
        `;
        posterBox.appendChild(fallback);
      }

      const title = document.createElement("div");
      title.className = "film-title";
      title.textContent = movie.title || "Untitled";

      item.appendChild(posterBox);
      item.appendChild(title);

      item.addEventListener("click", () => {
        localStorage.setItem("selectedMovie", JSON.stringify(movie));
        window.location.href = "film.html";
      });

      grid.appendChild(item);
    });

    // Pagination UI sync
    pageInfo.textContent = `Page ${page + 1} of ${totalPages}`;
    pageInput.value = page + 1;

    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= totalPages - 1;
  }


  /* ---------------------------------------------------------
      SORT BUTTON
  --------------------------------------------------------- */
  sortToggle.addEventListener("click", () => {
    sortMode = sortMode === "popularity" ? "alphabetical" : "popularity";
    sortToggle.textContent =
      `Sort: ${sortMode === "popularity" ? "Popularity" : "Alphabetical"}`;
    applySort();
    renderPage();
  });


  /* ---------------------------------------------------------
      PAGINATION BUTTONS
  --------------------------------------------------------- */
  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page--;
      renderPage();
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(sortedFilms.length / PAGE_SIZE);
    if (page < totalPages - 1) {
      page++;
      renderPage();
    }
  });


  /* ---------------------------------------------------------
      PAGE JUMP
  --------------------------------------------------------- */
  function jumpToPage() {
    const totalPages = Math.ceil(sortedFilms.length / PAGE_SIZE);
    let num = parseInt(pageInput.value, 10);

    if (isNaN(num)) return;

    num = Math.max(1, Math.min(num, totalPages));
    page = num - 1;
    renderPage();
  }

  pageGo.addEventListener("click", jumpToPage);
  pageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") jumpToPage();
  });


  /* ---------------------------------------------------------
      START APPLICATION
  --------------------------------------------------------- */
  loadFilms();

});
