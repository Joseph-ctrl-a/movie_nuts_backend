// backend/scripts/importAllPopular.js

require('dotenv').config();
const mongoose = require('mongoose');

const Movie = require('../db/models/movies/movie');
const { getPopular } = require('../services/tmdb');
const { getGenres } = require('../services/tmdbGenres');

async function importAllPopular() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected.\n');

    // Load genre map once
    console.log('Fetching genre list from TMDB...');
    const genreMap = await getGenres();
    console.log('Genres loaded:', Object.keys(genreMap).length);

    const TOTAL_PAGES = 500; // TMDB's max
    let totalImported = 0;

    console.log('\nStarting bulk import of 500 pages...\n');

    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Fetching page ${page} of ${TOTAL_PAGES}...`);

      const tmdbMovies = await getPopular(page);

      if (!tmdbMovies || tmdbMovies.length === 0) {
        console.log('No more movies returned. Stopping early.');
        break;
      }

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

      await Movie.bulkWrite(ops);
      totalImported += ops.length;

      console.log(`✔ Imported page ${page} (${ops.length} movies)\n`);
    }

    console.log(`🎉 Finished importing ${totalImported} total movies!`);
    mongoose.connection.close();
    process.exit();

  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
}

importAllPopular();
