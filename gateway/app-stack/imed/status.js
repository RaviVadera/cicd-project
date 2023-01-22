import * as fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statusFile = path.join(__dirname, '.status');

// current status of the observer
export const setListening = () => {
  fs.writeFileSync(statusFile, 'true');
};

export const isListening = () => {
  return (fs.readFileSync(statusFile).toString() === 'true');
};