import axios from 'axios';
import express from 'express';
import { StateManager } from './state-manager';

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
app.get('/state', async (req, res) => {
  try {
    const currentState = StateManager.getState();
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send(currentState).end();
  } catch (error) {
    console.log(error);
    return res.status(502).end();
  }
});

// TODO return state change log
app.get('/run-log', async (req, res) => {
  try {
    const stateLog = StateManager.getStateLog();
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send(stateLog).end();
  } catch (error) {
    console.log(error);
    return res.status(502).end();
  }
});

// TODO return rabbitmq statistics
// TODO return rabbitmq queue statistics

export default app;
