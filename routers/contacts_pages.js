// routers/contacts.pages.js
const express = require('express');
const path = require('path');
const router = express.Router();

const pub = path.join(__dirname, '..', 'public');

// /contacts -> list page
router.get('/', (_req, res) => {
  res.sendFile(path.join(pub, 'html', 'contacts.html'));
});

// /contacts/new -> create form
router.get('/new', (_req, res) => {
  res.sendFile(path.join(pub, 'html', 'new-contact.html'));
});

// /contacts/manage -> create/update/delete tester
router.get('/manage', (_req, res) => {
  res.sendFile(path.join(pub, 'html', 'manage-contacts.html'));
});

module.exports = router;
