// express web server
const express = require('express');
const app = express();
const lesson1Controller = require("./controllers/lesson1Controller")

app.use('/', require('./routers/index'))
app.listen(process.env.port || 3000);
console.log("Web Server Listening on localhost:3000");