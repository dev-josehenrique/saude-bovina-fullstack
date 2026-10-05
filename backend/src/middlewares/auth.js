const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../lib/AppError');

// Protege rotas: exige header "Authorization: Bearer <jwt>".
module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  // Tolerante a espaços extras entre "Bearer" e o token (comum ao colar em clientes como o Insomnia).
  const match = header.trim().match(/^Bearer\s+(\S+)$/i);
  const token = match?.[1];
  if (!token) {
    return next(new AppError('Token não informado', 401));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.usuario = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
};
