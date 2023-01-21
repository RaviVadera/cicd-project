import * as fs from 'fs';
import path from 'path';

export const State = Object.freeze({
  INIT: 'INIT',
  PAUSED: 'PAUSED',
  RUNNING: 'RUNNING',
  SHUTDOWN: 'SHUTDOWN',
});

const currentStatePath = path.join('/logs', 'state.current');
const stateLogPath = path.join('/logs', 'state.log');

export const StateManager = {
  getState: () => {
    return fs.readFileSync(currentStatePath, { encoding: 'utf-8' }).toString();
  },
  setState: (state) => {
    if (StateManager.getState() !== state) {
      // TODO perform state changes
      switch (state) {
        case State.INIT:
          // TODO start all containers ??
          // maybe define http interface between all containers
          // i.e. POST /_start | POST /_stop
          // and call apis for all containers to start
          setTimeout(() => setState(State.RUNNING), 1000);
          break;

        case State.RUNNING:
          // TODO call ORIG api to start sending messages
          break;

        case State.PAUSED:
          // TODO call ORIG api to stop sending messages
          break;

        case State.SHUTDOWN:
          // TODO stop all containers ??
          // maybe define http interface between all containers
          // i.e. POST /_start | POST /_stop
          // and call apis for all containers to stop
          break;
      }

      fs.writeFileSync(currentStatePath, state);
      const stateLogEntry = `${new Date().toISOString()}: ${state}\n`;
      // append state entry to file
      fs.appendFileSync(stateLogPath, stateLogEntry);
    }
  },
  getStateLog: () => {
    return fs.readFileSync(stateLogPath, { encoding: 'utf-8' }).toString();
  },
};
