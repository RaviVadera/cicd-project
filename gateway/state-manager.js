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

// a single-source-of-truth for the app stack
export const StateManager = {
  getState: () => {
    if (!fs.existsSync(currentStatePath))
      fs.writeFileSync(currentStatePath, '');
    return fs.readFileSync(currentStatePath, { encoding: 'utf-8' }).toString();
  },
  setState: async (state) => {
    if (StateManager.getState() !== state) {
      switch (state) {
        case State.INIT:
          // start the app compose stack
          // since the project required 'starting / stopping' all containers
          // on state change, it seemed a good idea to have a nested compose stack
          // controller by gateway
          try {
            await compose.upAll({
              cwd: path.join(__dirname, 'app-stack'),
              log: true,
              executablePath: 'docker',
              composeOptions: ['compose'],
              commandOptions: ['--build', '--wait'],
            });
            setTimeout(async () => {
              await StateManager.setState(State.RUNNING);
            }, 1000);
          } catch (e) {
            setTimeout(async () => {
              await StateManager.setState(State.SHUTDOWN);
            }, 1000);
          }
          break;

        case State.RUNNING:
          // call ORIG api to start sending messages
          const startResponse = await axios.post(`${origHost}/start`);
          if (startResponse.status !== 204)
            return;
          break;

        case State.PAUSED:
          // call ORIG api to stop sending messages
          const stopResponse = await axios.post(`${origHost}/stop`);
          if (stopResponse.status !== 204)
            return;
          break;

        case State.SHUTDOWN:
          // stop the app compose stack
          await compose.down({
            cwd: path.join(__dirname, 'app-stack'),
            log: true,
            executablePath: 'docker',
            composeOptions: ['compose'],
            commandOptions: [['--timeout', '100']]
          });
          break;
      }

      // update current state
      fs.writeFileSync(currentStatePath, state);
      const stateLogEntry = `${new Date().toISOString()}: ${state}\n`;
      // append state log entry to file
      fs.appendFileSync(stateLogPath, stateLogEntry);
    }
  },
  getStateLog: () => {
    if (!fs.existsSync(stateLogPath)) fs.writeFileSync(stateLogPath, '');
    return fs.readFileSync(stateLogPath, { encoding: 'utf-8' }).toString();
  },
};
