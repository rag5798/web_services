// routers/contacts.api.js
const router = require('express').Router();
const { ObjectId } = require('mongodb');
const { connect, getDb } = require('../database');

/**
 * @openapi
 * tags:
 *   - name: Contacts
 *     description: Contacts CRUD endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required: [firstName, lastName, email, favoriteColor, birthday]
 *       properties:
 *         _id:
 *           type: string
 *           description: Mongo ObjectId
 *           example: 66f0b8f3d9c0a8a7d1a2b3c4
 *         firstName:
 *           type: string
 *           example: Jane
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane.doe@example.com
 *         favoriteColor:
 *           type: string
 *           example: blue
 *         birthday:
 *           type: string
 *           format: date
 *           example: 1995-03-12
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /api/contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: Array of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   post:
 *     summary: Create a contact
 *     description: Creates a new contact. Optionally accepts a client-specified `_id` (Mongo ObjectId string) for demos.
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/Contact'
 *             example:
 *               firstName: Jane
 *               lastName: Doe
 *               email: jane.doe@example.com
 *               favoriteColor: blue
 *               birthday: 1995-03-12
 *     responses:
 *       201:
 *         description: Created; returns the new id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 66f0b8f3d9c0a8a7d1a2b3c4
 *       400:
 *         description: Validation error or invalid _id format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Duplicate email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/contacts/{id}:
 *   get:
 *     summary: Get a contact by id
 *     tags: [Contacts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Found contact
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Contact' }
 *       400:
 *         description: Invalid id format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Update a contact by id (replaces all fields)
 *     tags: [Contacts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *           example:
 *             firstName: Janet
 *             lastName: Doe
 *             email: janet.doe@example.com
 *             favoriteColor: green
 *             birthday: 1994-12-01
 *     responses:
 *       204:
 *         description: Updated (no content)
 *       400:
 *         description: Invalid id or validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Delete a contact by id
 *     tags: [Contacts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       400:
 *         description: Invalid id format
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

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

// --- API: GET one ---
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

    // Duplicate email guard
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
