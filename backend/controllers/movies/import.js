// backend/controllers/movies/import.js

const Movie = require('../../db/models/movies/movie');
const { getPopular } = require('../../services/tmdb');
const { getGenres } = require('../../services/tmdbGenres');

async function importPopular(req, res, next) {
  try {
    const page = Number(req.query.page || 1);

    // Fetch TMDB genre list once
    const genreMap = await getGenres();
    // Example: { 28: "Action", 878: "Science Fiction", ... }

    // Get one page of movies from TMDB
    const tmdbMovies = await getPopular(page);

    if (!tmdbMovies || tmdbMovies.length === 0) {
      return res.json({ imported: 0, page, message: "No movies found" });
    }

    // Prepare bulk database operations
    const ops = tmdbMovies.map(m => {
      const genreNames = (m.genre_ids || []).map(id => genreMap[id]);

      return {
        updateOne: {
          filter: { tmdbId: m.id },
          update: {
            tmdbId: m.id,
            title: m.title,
            overview: m.overview,
            releaseDate: m.release_date,
            posterPath: m.poster_path,
            backdropPath: m.backdrop_path,
            rating: m.vote_average,
            genres: genreNames,
          },
          upsert: true,
        }
      };
    });

    // Execute bulk insert/update
    await Movie.bulkWrite(ops);

    return res.json({
      imported: ops.length,
      page,
      success: true,
    });

  } catch (err) {
    console.error("Importer error:", err);
    next(err);
  }
}

module.exports = { importPopular };
