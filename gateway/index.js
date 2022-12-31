import app from './gateway.js';

const port = 3000;

// start listening for HTTP requests
app.listen(port, () => {
  console.log(`GATEWAY listening on port ${port}`);
});
