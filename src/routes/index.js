const express = require('express');
const router = require('./router.js');
const app = express();

/* GET home page. */
app.get('/', (req, res) => {
  res.sendFile('./src/public/index.html', { root: '.' });
});

// Route for retrieving search results
app.get('/search', router.search);

// Route for autocomplete
app.get('/suggest', router.suggest);

module.exports = app;
