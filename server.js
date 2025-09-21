// express web server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Robert');
});

app.listen(process.env.port || 3000);
console.log("Web Server Listening on localhost:3000");