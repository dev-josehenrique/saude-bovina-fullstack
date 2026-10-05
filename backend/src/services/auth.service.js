const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const AppError = require('../lib/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const publico = ({ id_usuario, nome, email }) => ({ id_usuario, nome, email });

function gerarToken(usuario) {
  return jwt.sign({ email: usuario.email }, jwtSecret, {
    subject: String(usuario.id_usuario),
    expiresIn: jwtExpiresIn,
  });
}

async function registrar({ nome, email, senha }) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new AppError('E-mail já cadastrado', 409);
  const senha_hash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({ data: { nome, email, senha_hash } });
  return { usuario: publico(usuario), token: gerarToken(usuario) };
}

async function login({ email, senha }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const ok = usuario && (await bcrypt.compare(senha, usuario.senha_hash));
  if (!ok) throw new AppError('Credenciais inválidas', 401);
  return { usuario: publico(usuario), token: gerarToken(usuario) };
}

async function perfil(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: Number(id) } });
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  return publico(usuario);
}

module.exports = { registrar, login, perfil };
