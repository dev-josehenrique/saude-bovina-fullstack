// Controller de autenticação: valida a entrada e chama o service para cadastro, login e perfil do usuário logado.
const service = require('../services/auth.service');
const { registroSchema, loginSchema } = require('../validators/auth.validator');

exports.registrar = async (req, res) => {
  const dados = registroSchema.parse(req.body);
  res.status(201).json(await service.registrar(dados));
};

exports.login = async (req, res) => {
  const dados = loginSchema.parse(req.body);
  res.json(await service.login(dados));
};

exports.me = async (req, res) => {
  res.json(await service.perfil(req.usuario.id));
};
