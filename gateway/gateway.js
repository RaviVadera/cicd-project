import axios from 'axios';
import express from 'express';
import { State, StateManager } from './state-manager.js';

const app = express();
const messagesHost = 'http://httpserv:3000';
const mqManagementHost = 'http://mq:15672';

const startTime = new Date();
let requestsCount = 0;

// count total number of requests
app.use((req, res, next) => {
  requestsCount++;
  next();
});
app.use(express.text());

// all endpoints which act as a proxy i.e. forwarding request to another source
// may responds with HTTP 502 when there is an error with the code / upstream
// all other endpoints respond with HTTP 500 indicating there is an unexpected error

// the messages entries from HTTPSERV
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

// update the stack state
app.put('/state', async (req, res) => {
  try {
    const newState = req.body;
    if (!newState) return res.status(400).send().end();
    const knownStates = Object.values(State);
    if (!knownStates.includes(newState)) return res.status(400).send().end();
    await StateManager.setState(newState);
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send().end();
  } catch (error) {
    return res.status(500).end();
  }
});

// the current state of app stack
app.get('/state', async (req, res) => {
  try {
    const currentState = StateManager.getState();
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send(currentState).end();
  } catch (error) {
    return res.status(500).end();
  }
});

// state change log
app.get('/run-log', async (req, res) => {
  try {
    const stateLog = StateManager.getStateLog();
    res.header('Content-Type', 'text/plain; charset=utf-8');
    return res.send(stateLog).end();
  } catch (error) {
    return res.status(500).end();
  }
});

// rabbitmq core statistics
app.get('/node-statistic', async (req, res) => {
  try {
    const serviceResponse = await axios.get(`${mqManagementHost}/api/nodes`, {
      auth: {
        username: 'guest',
        password: 'guest',
      },
    });
    if (serviceResponse.status !== 200) {
      return res.status(502).end();
    }
    // assuming the mq cluster has only one node
    // since no specific requirements were provided
    // on how to handle the metrics for multi-node cluster
    // this should suffice the needs for the project
    const firstNodeData = serviceResponse.data[0];
    const responseToSend = {
      mem_alarm: firstNodeData['mem_alarm'],
      disk_free_alarm: firstNodeData['disk_free_alarm'],
      uptime: firstNodeData['uptime'],
      proc_used: firstNodeData['proc_used'],
      sockets_used: firstNodeData['sockets_used'],
    };
    res.header('Content-Type', 'application/json; charset=utf-8');
    return res.send(responseToSend).end();
  } catch (error) {
    return res.status(502).end();
  }
});

// rabbitmq queue statistics
app.get('/queue-statistic', async (req, res) => {
  try {
    const serviceResponse = await axios.get(`${mqManagementHost}/api/queues`, {
      auth: {
        username: 'guest',
        password: 'guest',
      },
    });
    if (serviceResponse.status !== 200) {
      return res.status(502).end();
    }
    // extract statistic for each queue in mq
    const responseToSend = serviceResponse.data.map((queue) => ({
      name: queue.name,
      messages_delivered_recently: queue.message_stats.deliver_no_ack,
      messages_delivery_Rate: queue.message_stats.deliver_no_ack_details.rate,
      messages_published_lately: queue.message_stats.publish,
      messages_publishing_rate: queue.message_stats.publish_details.rate,
    }));
    res.header('Content-Type', 'application/json; charset=utf-8');
    return res.send(responseToSend).end();
  } catch (error) {
    return res.status(502).end();
  }
});

// state change log
app.get('/statistic', async (req, res) => {
  try {
    const htmlBody = `<html>
      <body>
        Gateway Start Time: ${startTime}
        Total Number of Requests Received: ${requestsCount}
        Current Status of App Stack: ${StateManager.getState()}
      </body>
    </html>`;
    res.header('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlBody).end();
  } catch (error) {
    return res.status(500).end();
  }
});

export default app;
