// backend/models/movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: String,
    overview: String,
    releaseDate: String,
    posterPath: String,
    backdropPath: String,
    rating: Number,
    genres: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);