import app from './gateway.js';
import { State, StateManager } from './state-manager.js';

const port = 3000;

// start listening for HTTP requests
app.listen(port, () => {
  StateManager.setState(State.INIT);
  console.log(`GATEWAY listening on port ${port}`);
});
