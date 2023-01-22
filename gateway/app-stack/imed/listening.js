import { isListening } from "./status.js";

// used as a healthcheck
if (!isListening())
  process.exit(1);
else
  process.exit(0);