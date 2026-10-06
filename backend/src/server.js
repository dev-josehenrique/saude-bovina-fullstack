// Ponto de entrada da API: importa o app do Express e o coloca para escutar na porta configurada.
const { port } = require('./config/env');
const app = require('./app');

app.listen(port, () => {
  console.log(`API SGDSB rodando em http://localhost:${port}/api`);
});
