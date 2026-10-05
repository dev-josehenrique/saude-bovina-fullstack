const service = require('../services/bovino.service');
const {
  criarBovinoSchema,
  atualizarBovinoSchema,
  pesagemSchema,
  idSchema,
} = require('../validators/bovino.validator');

exports.listar = async (req, res) => {
  res.json(await service.listar(req.query));
};

exports.buscarPorId = async (req, res) => {
  res.json(await service.buscarPorId(idSchema.parse(req.params.id)));
};

exports.criar = async (req, res) => {
  const dados = criarBovinoSchema.parse(req.body);
  res.status(201).json(await service.criar(dados));
};

exports.atualizar = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const dados = atualizarBovinoSchema.parse(req.body);
  res.json(await service.atualizar(id, dados));
};

exports.remover = async (req, res) => {
  await service.remover(idSchema.parse(req.params.id));
  res.status(204).send();
};

exports.registrarPesagem = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const dados = pesagemSchema.parse(req.body);
  res.status(201).json(await service.registrarPesagem(id, dados));
};
