document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("genre-list");

  // Automatically detect the correct folder (e.g., /frontend/)
  const currentPath = window.location.pathname;
  const basePath = currentPath.substring(0, currentPath.lastIndexOf("/") + 1);

  async function loadGenres() {
    try {
      const res = await fetch("http://localhost:5000/api/movies/genres");
      const genres = await res.json();

      if (!Array.isArray(genres)) {
        list.textContent = "Could not load genres.";
        return;
      }

      list.innerHTML = "";

      // Build clickable genre items
      genres.forEach((g) => {
        const item = document.createElement("div");
        item.className = "genre-item";
        item.textContent = g;

        item.addEventListener("click", () => {
          const target = `${basePath}browsing.html?genre=${encodeURIComponent(g)}`;

          console.log("Navigating to:", target);

          window.location.href = target;
        });

        list.appendChild(item);
      });

    } catch (err) {
      console.error(err);
      list.textContent = "Failed to load genres.";
    }
  }

  loadGenres();
});
