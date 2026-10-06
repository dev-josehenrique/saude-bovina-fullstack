// Classe de erro com status HTTP, usada nos services para sinalizar erros esperados (ex.: 404, 409).
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

module.exports = AppError;
