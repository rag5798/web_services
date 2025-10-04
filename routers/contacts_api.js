// routers/contacts.api.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const { connect, getDb } = require('../database');

// --- helpers ---
function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) || !isNaN(Date.parse(value));
}
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function sanitize(s) {
  return String(s ?? '').trim();
}
function validateContact(payload) {
  const contact = {
    firstName: sanitize(payload.firstName),
    lastName: sanitize(payload.lastName),
    email: sanitize(payload.email).toLowerCase(),
    favoriteColor: sanitize(payload.favoriteColor),
    birthday: sanitize(payload.birthday)
  };
  const missing = Object.entries(contact).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return { ok: false, error: `Missing required field(s): ${missing.join(', ')}` };
  if (!isEmail(contact.email)) return { ok: false, error: 'Invalid email format' };
  if (!isIsoDate(contact.birthday)) return { ok: false, error: 'birthday must be an ISO date (e.g. 1995-03-12)' };
  return { ok: true, contact };
}

// --- API: GET all ---
router.get('/', async (_req, res) => {
  try {
    await connect();
    const db = getDb();
    const docs = await db.collection('contacts').find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error('GET /api/contacts', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- API: GET one (validate id inside) ---
router.get('/:id', async (req, res) => {
  try {
    await connect();
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id format' });

    const doc = await db.collection('contacts').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('GET /api/contacts/:id', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- API: POST create (returns new id) ---
// --- API: POST create (returns new id) ---
router.post('/', async (req, res) => {
  try {
    await connect();
    const db = getDb();

    const check = validateContact(req.body);
    if (!check.ok) return res.status(400).json({ error: check.error });
    const contact = check.contact;

    // Optional: accept a client-specified _id for testing/demos
    const maybeId = req.body._id;
    let doc = contact;
    if (maybeId != null && maybeId !== '') {
      if (!ObjectId.isValid(maybeId)) {
        return res.status(400).json({ error: 'Invalid _id format' });
      }
      doc = { _id: new ObjectId(maybeId), ...contact };
    }

    // Duplicate email guard (kept as-is)
    const existing = await db.collection('contacts').findOne({ email: contact.email });
    if (existing) return res.status(409).json({ error: 'A contact with that email already exists' });

    const result = await db.collection('contacts').insertOne(doc);
    const id = (doc._id ?? result.insertedId).toString();
    return res.status(201).json({ id });
  } catch (err) {
    console.error('POST /api/contacts', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- API: PUT update (all fields required; 204) ---
router.put('/:id', async (req, res) => {
  try {
    await connect();
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id format' });

    const check = validateContact(req.body);
    if (!check.ok) return res.status(400).json({ error: check.error });
    const contact = check.contact;

    const result = await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: contact }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('PUT /api/contacts/:id', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- API: DELETE one (204) ---
router.delete('/:id', async (req, res) => {
  try {
    await connect();
    const db = getDb();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id format' });

    const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('DELETE /api/contacts/:id', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;