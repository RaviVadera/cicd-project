import * as fs from 'fs';
import path from 'path';

export const State = Object.freeze({
  INIT: 'INIT',
  PAUSED: 'PAUSED',
  RUNNING: 'RUNNING',
  SHUTDOWN: 'SHUTDOWN',
});

const messageLogPath = path.join('/logs', 'state.current');

export const StateManager = {
  getState: () => {
    return fs.readFileSync(messageLogPath, { encoding: 'utf-8' }).toString();
  },
  setState: (state) => {
    fs.writeFileSync(messageLogPath, state);
  },
};
