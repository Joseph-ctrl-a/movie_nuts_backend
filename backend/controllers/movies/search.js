// backend/controllers/movies/search.js
const Movie = require('../../db/models/movies/movie');

async function searchLocalMovies(req, res) {
  const q = req.query.q || "";
  if (!q) return res.json([]);

  const regex = new RegExp(q, "i");

  const results = await Movie.find({
    title: { $regex: regex }
  }).limit(5);

  res.json(results);
}

module.exports = { searchLocalMovies };
