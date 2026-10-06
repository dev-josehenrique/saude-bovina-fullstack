// Configura a aplicação Express: CORS, leitura de JSON, rotas em /api e middlewares de rota não encontrada e de erro.
const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
