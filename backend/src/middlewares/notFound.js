// Middleware que responde 404 para qualquer rota que não exista na API.
module.exports = (req, res) =>
  res.status(404).json({ error: `Rota ${req.method} ${req.originalUrl} não encontrada` });
