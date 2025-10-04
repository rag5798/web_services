// web_services/routers/contacts.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const { connect, getDb } = require('../db/conn');

// GET all contacts
router.get('/', async (req, res) => {
  try {
    await connect();
    const db = getDb();
    const contacts = await db.collection('contacts').find({}).toArray();
    res.json(contacts);
  } catch (err) {
    console.error('GET /contacts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET contact by id (supports either /contacts/:id OR /contacts?id=...)
router.get('/:id?', async (req, res) => {
  try {
    await connect();
    const db = getDb();
    const id = req.params.id || req.query.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const doc = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('GET /contacts/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
