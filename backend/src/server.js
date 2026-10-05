const { port } = require('./config/env');
const app = require('./app');

app.listen(port, () => {
  console.log(`API SGDSB rodando em http://localhost:${port}/api`);
});
