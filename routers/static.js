// web_services/routers/static.js
const express = require('express');
const path = require('path');
const router = express.Router();

const pub = path.join(__dirname, '..', 'public'); // safer

router.use(express.static(pub));
router.use('/css', express.static(path.join(pub, 'css')));
router.use('/js', express.static(path.join(pub, 'js')));
router.use('/images', express.static(path.join(pub, 'images')));

module.exports = router;