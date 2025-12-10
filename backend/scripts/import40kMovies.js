// backend/scripts/import40kMovies.js

require('dotenv').config();
const mongoose = require('mongoose');

const Movie = require('../db/models/movies/movie');
const { getDiscover } = require('../services/tmdbDiscover');
const { getGenres } = require('../services/tmdbGenres');

async function import40kMovies() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to DB");

    const genreMap = await getGenres();
    console.log("Genres loaded");

    let totalImported = 0;

    const LOOPS = [
      {
        label: "Popularity",
        buildParams: (page) => ({
          page,
          sort_by: "popularity.desc"
        })
      },
      {
        label: "Rating",
        buildParams: (page) => ({
          page,
          sort_by: "vote_average.desc",
          "vote_count.gte": 200  // avoids obscure films
        })
      },
      {
        label: "1980-1999",
        buildParams: (page) => ({
          page,
          "primary_release_date.gte": "1980-01-01",
          "primary_release_date.lte": "1999-12-31"
        })
      },
      {
        label: "2000-2009",
        buildParams: (page) => ({
          page,
          "primary_release_date.gte": "2000-01-01",
          "primary_release_date.lte": "2009-12-31"
        })
      },
      {
        label: "2010-2019",
        buildParams: (page) => ({
          page,
          "primary_release_date.gte": "2010-01-01",
          "primary_release_date.lte": "2019-12-31"
        })
      },
      {
        label: "2020-2025",
        buildParams: (page) => ({
          page,
          "primary_release_date.gte": "2020-01-01",
          "primary_release_date.lte": "2025-12-31"
        })
      },
      {
        label: "Before 1980",
        buildParams: (page) => ({
          page,
          "primary_release_date.lte": "1979-12-31"
        })
      }
    ];

    const PAGES_PER_LOOP = 500;   // full TMDB limit

    for (const loop of LOOPS) {
      console.log(`\n=== Importing ${loop.label} Movies ===\n`);

      for (let page = 1; page <= PAGES_PER_LOOP; page++) {
        const params = loop.buildParams(page);
        console.log(`Fetching page ${page} of ${loop.label}`);

        const movies = await getDiscover(params);

        if (!movies || movies.length === 0) {
          console.log("No more movies — breaking early");
          break;
        }

        const ops = movies.map(m => {
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
                genres: genreNames
              },
              upsert: true
            }
          };
        });

        await Movie.bulkWrite(ops);
        totalImported += ops.length;

        console.log(`Imported ${ops.length} from page ${page}`);
      }
    }

    console.log(`\n🎉 Finished importing roughly ${totalImported} movie documents!`);
    mongoose.connection.close();
    process.exit();

  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
}

import40kMovies();
