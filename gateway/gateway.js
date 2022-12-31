import express from 'express';

const app = express();

// TODO return the messages entries from HTTPSERV
app.get('/messages', (req, res) => {
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send('Hello World!');
});

// TODO update the state
// TODO return the current state
// TODO return state change log
// TODO return rabbitmq statistics
// TODO return rabbitmq queue statistics

export default app;