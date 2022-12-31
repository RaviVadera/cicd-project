import * as fs from 'fs';
import path from 'path';

export const State = Object.freeze({
  INIT: Symbol('INIT'),
  PAUSED: Symbol('PAUSED'),
  RUNNING: Symbol('RUNNING'),
  SHUTDOWN: Symbol('SHUTDOWN'),
});

const messageLogPath = path.join('/logs', 'state.log');

export const StateManager = {
  getState: () => {
    return fs.readFileSync(messageLogPath, { encoding: 'utf-8' }).toString();
  },
  setState: (state) => {
    fs.writeFileSync(messageLogPath, state.toString());
  },
};
