// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();

// --- Core middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description: 'API documentation for the Contacts project',
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Local' },
      { url: 'https://cse-341-ndqq.onrender.com/', description: 'Render' },
    ],
    components: {
      schemas: {
        Contact: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'favoriteColor', 'birthday'],
          properties: {
            _id: { type: 'string', description: 'Mongo ObjectId' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            favoriteColor: { type: 'string' },
            birthday: { type: 'string', format: 'date' },
          },
        },
        Error: {
            type: 'object',
            properties: { error: { type: 'string' } },
        },
      },
      parameters: {
        ContactId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', example: '66f0b8f3d9c0a8a7d1a2b3c4' },
        },
      },
    },
  },
  // point this at your API route files where you'll add JSDoc annotations:
  apis: ['./routers/contacts_api.js'],
});

app.get('/health', (req, res) => res.status(200).send('OK'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// --- API routes (JSON) ---
app.use('/api/contacts', require('./routers/contacts_api')); // JSON API

// --- Page routes (HTML) ---
app.use('/contacts', require('./routers/contacts_pages'));   // HTML pages
app.use('/', require('./routers/static'));
app.use('/', require('./routers/index'));                    // keep this last if it has "catch-all"

// --- Start server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Web Server Listening on :${PORT}`));
