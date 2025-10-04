// web_services/db/conn.js
const { MongoClient } = require('mongodb');

let _client;
let _db;

async function connect() {
  if (_db) return _db;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'contactsdb';

  _client = new MongoClient(uri);
  await _client.connect();
  _db = _client.db(dbName);
  return _db;
}

function getDb() {
  if (!_db) throw new Error('Database not initialized. Call connect() first.');
  return _db;
}

async function close() {
  if (_client) await _client.close();
  _client = null;
  _db = null;
}

module.exports = { connect, getDb, close };
