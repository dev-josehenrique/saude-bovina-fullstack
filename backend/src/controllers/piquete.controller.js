// Controller de piquetes: valida a entrada e chama o service para listar, buscar por id e criar piquetes.
const service = require('../services/piquete.service');
const { criarPiqueteSchema } = require('../validators/piquete.validator');
const { idSchema } = require('../validators/bovino.validator');

exports.listar = async (req, res) => {
  res.json(await service.listar());
};

exports.buscarPorId = async (req, res) => {
  res.json(await service.buscarPorId(idSchema.parse(req.params.id)));
};

exports.criar = async (req, res) => {
  res.status(201).json(await service.criar(criarPiqueteSchema.parse(req.body)));
};
