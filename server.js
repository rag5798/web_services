// express web server
const express = require('express');
const app = express();
const lesson1Controller = require("./controllers/index.js")

app.get('/', lesson1Controller.RobertRoute);

app.get('/maddy', lesson1Controller.MaddyRoute)

app.listen(process.env.port || 3000);
console.log("Web Server Listening on localhost:3000");