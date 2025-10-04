// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static + root routes (keep yours)
app.use('/', require('./routers/static'));
app.use('/', require('./routers/index'));

// NEW: split pages and API
app.use('/contacts', require('./routers/contacts_pages'));   // HTML pages
app.use('/api/contacts', require('./routers/contacts_api')); // JSON API

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Web Server Listening on localhost:${PORT}`));