import axios from 'axios';
import express from 'express';

const app = express();
const messagesHost = 'http://httpserv:3000';

// TODO return the messages entries from HTTPSERV
app.get('/messages', async (req, res) => {
  try {
    const serviceResponse = await axios.get(`${messagesHost}`);
    res.status(serviceResponse.status);
    Object.keys(serviceResponse.headers).forEach((serviceHeader) => {
      res.header(serviceHeader, serviceResponse.headers[serviceHeader]);
    });
    return res.send(serviceResponse.data).end();
  } catch (error) {
    return res.status(502).end();
  }
});

// TODO update the state
// TODO return the current state
// TODO return state change log
// TODO return rabbitmq statistics
// TODO return rabbitmq queue statistics

export default app;
