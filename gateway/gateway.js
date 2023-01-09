import axios from 'axios';
import express from 'express';
import { State, StateManager } from './state-manager.js';

const app = express();
const messagesHost = 'http://httpserv:3000';

//app.use(bodyParserErrorHandler());
app.use(express.text());

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
    return res.status(500).end();
  }
});

// TODO update the state
app.put('/state', async (req, res) => {
  try {
    const newState = req.body;
    if (!newState) return res.status(400).send().end();
    const knownStates = Object.values(State);
    if (!knownStates.includes(newState)) return res.status(400).send().end();
    const currentState = StateManager.getState();
    if (currentState === newState) {
      res.header('Content-Type', 'text/plain; charset=utf-8');
      return res.send().end();
    } else {
      // TODO execute tasks for new state
      StateManager.setState(newState);
      res.header('Content-Type', 'text/plain; charset=utf-8');
      return res.send().end();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

// TODO return the current state
app.get('/state', async (req, res) => {
  try {
    const currentState = StateManager.getState();
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send(currentState).end();
  } catch (error) {
    console.log(error);
    return res.status(500).end();
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
    return res.status(500).end();
  }
});

// TODO return rabbitmq statistics
// TODO return rabbitmq queue statistics

export default app;
