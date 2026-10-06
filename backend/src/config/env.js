// Carrega o .env, exige DATABASE_URL e JWT_SECRET e exporta as configurações (porta, JWT, origens CORS).
require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ${key} não definida. Copie .env.example para .env`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()),
};
