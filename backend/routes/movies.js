const express = require('express');
const { importPopular } = require('../controllers/movies/import');
const { searchLocalMovies } = require('../controllers/movies/search');

const router = express.Router();

// GET /api/movies/import-popular
router.get('/import-popular', importPopular);

// GET /api/movies/search?q=Batman
router.get('/search', searchLocalMovies);

module.exports = router;
