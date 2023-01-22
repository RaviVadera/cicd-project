import express from 'express';
import * as fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

const messageLogPath = path.join('/logs', 'message.log');

// return the messages entries from file
app.get('/', (req, res) => {
    const message_log = fs.readFileSync(messageLogPath, { encoding: 'utf-8' }).toString();
    res.header('Content-Type', 'text/plain');
    res.send(message_log);
});

// start listening for HTTP requests
app.listen(port, () => {
    console.log(`HTTPSERV listening on port ${port}`);
});