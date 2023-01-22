import axios from 'axios';
import compose from 'docker-compose';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const State = Object.freeze({
  INIT: 'INIT',
  PAUSED: 'PAUSED',
  RUNNING: 'RUNNING',
  SHUTDOWN: 'SHUTDOWN',
});

const currentStatePath = path.join('/logs', 'state.current');
const stateLogPath = path.join('/logs', 'state.log');
const origHost = 'http://orig:3000';

export const StateManager = {
  getState: () => {
    if (!fs.existsSync(currentStatePath))
      fs.writeFileSync(currentStatePath, '');
    return fs.readFileSync(currentStatePath, { encoding: 'utf-8' }).toString();
  },
  setState: async (state) => {
    if (StateManager.getState() !== state) {
      // TODO perform state changes
      switch (state) {
        case State.INIT:
          // TODO start all containers ??
          // maybe define http interface between all containers
          // i.e. POST /_start | POST /_stop
          // and call apis for all containers to start
          try {
            const upResult = await compose.upAll({
              cwd: path.join(__dirname, 'app-stack'),
              log: true,
              executablePath: 'docker',
              composeOptions: ['compose'],
              commandOptions: ['--build', '--wait'],
            });
            console.log({ upResult });
            await StateManager.setState(State.RUNNING);
          } catch (e) {
            await StateManager.setState(State.SHUTDOWN);
          }
          break;

        case State.RUNNING:
          // TODO call ORIG api to start sending messages
          const startResponse = await axios.get(`${origHost}/start`);
          if (startResponse.status !== 200)
            return;
          break;

        case State.PAUSED:
          // TODO call ORIG api to stop sending messages
          const stopResponse = await axios.get(`${origHost}/stop`);
          if (stopResponse.status !== 200)
            return;
          break;

        case State.SHUTDOWN:
          // TODO stop all containers ??
          // maybe define http interface between all containers
          // i.e. POST /_start | POST /_stop
          // and call apis for all containers to stop
          await compose.down({
            cwd: path.join(__dirname, 'app-stack'),
            log: true,
            executablePath: 'docker',
            composeOptions: ['compose'],
            commandOptions: [['--timeout', '100']]
          });
          break;
      }

      fs.writeFileSync(currentStatePath, state);
      const stateLogEntry = `${new Date().toISOString()}: ${state}\n`;
      // append state entry to file
      fs.appendFileSync(stateLogPath, stateLogEntry);
    }
  },
  getStateLog: () => {
    if (!fs.existsSync(stateLogPath)) fs.writeFileSync(stateLogPath, '');
    return fs.readFileSync(stateLogPath, { encoding: 'utf-8' }).toString();
  },
};
