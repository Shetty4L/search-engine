const express = require('express');
const app = express();
const router = require('./router.js');

/* GET home page. */
app.get('/search', router.search);

module.exports = app;
