import app from './gateway.js';
import { State, StateManager } from './state-manager.js';

const port = 3000;

process.on('SIGTERM', async () => {
  await StateManager.setState(State.SHUTDOWN);
  process.exit(0);
});

// start listening for HTTP requests
app.listen(port, async () => {
  await StateManager.setState(State.INIT);
  console.log(`GATEWAY listening on port ${port}`);
});
