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
    fs.writeFileSync(currentStatePath, state);
  },
  getStateLog: () => {
    return fs.readFileSync(stateLogPath, { encoding: 'utf-8' }).toString();
  },
};
