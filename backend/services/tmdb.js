const axios = require('axios');

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    Accept: 'application/json',
  }
});

async function getPopular(page = 1) {
  const res = await tmdbClient.get('movie/popular', {
    params: { page }
  });
  return res.data.results;
}

async function searchMovies(query, page = 1) {
  const res = await tmdbClient.get('search/movie', {
    params: { query, page }
  });
  return res.data.results;
}

module.exports = { getPopular, searchMovies };
