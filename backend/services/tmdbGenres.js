// backend/services/tmdbGenres.js
const axios = require('axios');

async function getGenres() {
  const res = await axios.get(
    'https://api.themoviedb.org/3/genre/movie/list',
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
    }
  );

  // Convert array → object map: { 28: "Action", 18: "Drama" }
  const map = {};
  res.data.genres.forEach(g => {
    map[g.id] = g.name;
  });

  return map;
}

module.exports = { getGenres };
