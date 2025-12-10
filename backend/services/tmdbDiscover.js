const axios = require('axios');

async function getDiscover(params) {
  const res = await axios.get(
    "https://api.themoviedb.org/3/discover/movie",
    {
      params,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        accept: "application/json",
      }
    }
  );

  return res.data.results;
}

module.exports = { getDiscover };
