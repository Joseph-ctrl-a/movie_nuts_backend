// film.js — Final Complete Version

document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------------------------------------
     Element Cache
  ----------------------------------------------------------- */
  const posterEl = document.getElementById("film-poster");
  const titleEl = document.getElementById("film-title");
  const releaseEl = document.getElementById("film-release-date");
  const genresEl = document.getElementById("film-genres");
  const descEl = document.getElementById("film-description");

  const ratingEl = document.getElementById("film-rating");

  const blogListEl = document.getElementById("blog-list");
  const prevBtn = document.getElementById("blogs-prev");
  const nextBtn = document.getElementById("blogs-next");

  /* -----------------------------------------------------------
     Utility: Render Film Rating (Full-size acorns)
  ----------------------------------------------------------- */
  function renderAcornRating(container, score) {
    container.innerHTML = "";

    // TMDB gives 0–10, normalize to 0–5
    const outOfFive = score > 5 ? score / 2 : score;

    const full = Math.floor(outOfFive);
    const half = outOfFive % 1 >= 0.25 && outOfFive % 1 <= 0.75;
    const empty = 5 - full - (half ? 1 : 0);

    for (let i = 0; i < full; i++) {
      const span = document.createElement("span");
      span.className = "acorn full";
      container.appendChild(span);
    }

    if (half) {
      const span = document.createElement("span");
      span.className = "acorn half";
      container.appendChild(span);
    }

    for (let i = 0; i < empty; i++) {
      const span = document.createElement("span");
      span.className = "acorn empty";
      container.appendChild(span);
    }
  }

  /* -----------------------------------------------------------
     Utility: Render Mini Rating (Blog acorns)
  ----------------------------------------------------------- */
  function renderMiniAcornRating(score) {
    const container = document.createElement("div");
    container.className = "blog-acorn-rating";

    const outOfFive = score > 5 ? score / 2 : score;

    const full = Math.floor(outOfFive);
    const half = outOfFive % 1 >= 0.25 && outOfFive % 1 <= 0.75;
    const empty = 5 - full - (half ? 1 : 0);

    for (let i = 0; i < full; i++) {
      const span = document.createElement("span");
      span.className = "acorn-mini full";
      container.appendChild(span);
    }

    if (half) {
      const span = document.createElement("span");
      span.className = "acorn-mini half";
      container.appendChild(span);
    }

    for (let i = 0; i < empty; i++) {
      const span = document.createElement("span");
      span.className = "acorn-mini empty";
      container.appendChild(span);
    }

    return container;
  }

  /* -----------------------------------------------------------
     Load Movie From localStorage
  ----------------------------------------------------------- */
  let movie = null;
  try {
    const stored = localStorage.getItem("selectedMovie");
    if (stored) movie = JSON.parse(stored);
  } catch {}

  if (!movie) {
    titleEl.textContent = "No film selected";
    descEl.textContent =
      "Go back to the homepage and choose a film from the search bar.";
    return;
  }

  /* -----------------------------------------------------------
     Populate Film Details
  ----------------------------------------------------------- */
  const posterPath = movie.posterPath || movie.poster_path || "";
  posterEl.src = posterPath
    ? `https://image.tmdb.org/t/p/w780${posterPath}`
    : "https://via.placeholder.com/500x750?text=No+Poster+Available";

  titleEl.textContent = movie.title || movie.name || "Untitled film";

  releaseEl.textContent =
    movie.release_date ||
    movie.releaseDate ||
    movie.first_air_date ||
    "Unknown";

  if (Array.isArray(movie.genres)) {
    genresEl.textContent = movie.genres
      .map((g) => (typeof g === "string" ? g : g.name || ""))
      .join(", ");
  } else {
    genresEl.textContent = "Not specified";
  }

  descEl.textContent =
    movie.overview || movie.description || "No description available.";

  // Film rating
  const movieScore = movie.vote_average || movie.rating || 0;
  renderAcornRating(ratingEl, movieScore);

  /* -----------------------------------------------------------
     Placeholder Blog Data
     (Now includes username, pfp, and rating)
  ----------------------------------------------------------- */
  let blogs = [
    {
      title: "Is this the most goated movie of all",
      excerpt: "Fuck yeah it is",
      uploadedAt: "2025-11-28",
      username: "ME!!!",
      pfp: "images/fat-dog-fat.gif",
      rating: 5
    },
    {
      title: "Is this the most goated movie of all",
      excerpt: "Fuck yeah it is",
      uploadedAt: "2025-11-28",
      username: "ME!!!",
      pfp: "images/fat-dog-fat.gif",
      rating: 3.5
    },
    {
      title: "Is this the most goated movie of all",
      excerpt: "Fuck yeah it is",
      uploadedAt: "2025-11-28",
      username: "ME!!!",
      pfp: "images/fat-dog-fat.gif",
      rating: 4.5
    },
    {
      title: "Is this the most goated movie of all",
      excerpt: "Fuck yeah it is",
      uploadedAt: "2025-11-28",
      username: "ME!!!",
      pfp: "images/fat-dog-fat.gif",
      rating: 2.5
    },
    {
      title: "Is this the most goated movie of all",
      excerpt: "Fuck yeah it is",
      uploadedAt: "2025-11-28",
      username: "ME!!!",
      pfp: "images/fat-dog-fat.gif",
      rating: 5
    },
  ];

  // Duplicate for pagination (remove later)
  blogs = [...blogs, ...blogs, ...blogs];

  // Sort by newest first
  blogs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  /* -----------------------------------------------------------
     Pagination Setup
  ----------------------------------------------------------- */
  const PAGE_SIZE = 10;
  let page = 0;
  const totalPages = Math.ceil(blogs.length / PAGE_SIZE);

  /* -----------------------------------------------------------
     Render Blogs
  ----------------------------------------------------------- */
  function renderBlogs() {
    blogListEl.innerHTML = "";

    const start = page * PAGE_SIZE;
    const pageItems = blogs.slice(start, start + PAGE_SIZE);

    pageItems.forEach((blog) => {
      const item = document.createElement("div");
      item.className = "blog-item";

      /* --- Header: avatar + username + date --- */
      const header = document.createElement("div");
      header.className = "blog-header";

      const avatar = document.createElement("img");
      avatar.className = "blog-avatar";
      avatar.src = blog.pfp;
      avatar.alt = `${blog.username} avatar`;

      const userInfo = document.createElement("div");
      userInfo.className = "blog-user-info";

      const userName = document.createElement("div");
      userName.className = "blog-username";
      userName.textContent = blog.username;

      const uploadDate = document.createElement("div");
      uploadDate.className = "blog-upload-date";
      uploadDate.textContent = blog.uploadedAt;

      userInfo.appendChild(userName);
      userInfo.appendChild(uploadDate);

      header.appendChild(avatar);
      header.appendChild(userInfo);

      /* --- Blog title --- */
      const title = document.createElement("div");
      title.className = "blog-item-title";
      title.textContent = blog.title;

      /* --- Blog rating --- */
      const rating = renderMiniAcornRating(blog.rating || 0);

      /* --- Blog excerpt --- */
      const excerpt = document.createElement("div");
      excerpt.className = "blog-item-excerpt";
      excerpt.textContent = blog.excerpt;

      /* --- Assemble --- */
      item.appendChild(header);
      item.appendChild(title);
      item.appendChild(rating);
      item.appendChild(excerpt);

      blogListEl.appendChild(item);
    });

    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= totalPages - 1;
  }

  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page--;
      renderBlogs();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (page < totalPages - 1) {
      page++;
      renderBlogs();
    }
  });

  renderBlogs();
});
