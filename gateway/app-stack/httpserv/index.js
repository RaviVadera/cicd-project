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

// re-write the log file to be empty before listening for requests
// the listening for requests can be interpreted as health check
// and is used to determine synchronization between containers
console.log(`Re-writing message log file at ${messageLogPath}`);
fs.writeFileSync(messageLogPath, '', { encoding: 'utf-8' });
console.log(`Re-written message log file at ${messageLogPath}`);

// start listening for HTTP requests
app.listen(port, () => {
    console.log(`HTTPSERV listening on port ${port}`);
});