const express = require("express");
const router = express.Router();

// Correct model path based on your folder structure
const Movie = require("../db/models/movies/movie");

// GET ALL MOVIES
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find({}).lean();
    res.json(movies);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});
router.get("/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genres");
    genres.sort();
    res.json(genres);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not load genres" });
  }
});
// GET /api/movies/search?q=term
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const movies = await Movie.find({
      title: { $regex: q, $options: "i" },
    })
      .limit(10)
      .select("title posterPath");

    res.json(movies);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});
module.exports = router;