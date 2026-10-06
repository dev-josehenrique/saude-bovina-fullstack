// Controller de veterinários: valida a entrada e chama o service para listar, buscar, criar e atualizar veterinários.
const service = require('../services/veterinario.service');
const { criarVeterinarioSchema, atualizarVeterinarioSchema } = require('../validators/piquete.validator');
const { idSchema } = require('../validators/bovino.validator');

exports.listar = async (req, res) => {
  res.json(await service.listar());
};

exports.buscarPorId = async (req, res) => {
  res.json(await service.buscarPorId(idSchema.parse(req.params.id)));
};

exports.criar = async (req, res) => {
  res.status(201).json(await service.criar(criarVeterinarioSchema.parse(req.body)));
};

exports.atualizar = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  res.json(await service.atualizar(id, atualizarVeterinarioSchema.parse(req.body)));
};
