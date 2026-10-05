const service = require('../services/tratamento.service');
const vacinacao = require('../services/vacinacao.service');
const registro = require('../services/registro.service');
const { vacinacaoLoteSchema, ocorrenciaSchema, tratamentoSchema } = require('../validators/registros.validator');
const { idSchema } = require('../validators/bovino.validator');

exports.listar = async (req, res) => {
  res.json(await service.listar(req.query));
};

exports.tipos = async (req, res) => {
  res.json(await service.tipos());
};

exports.doencas = async (req, res) => {
  res.json(await registro.doencas());
};

exports.medicamentos = async (req, res) => {
  res.json(await registro.medicamentos());
};

exports.vacinarLote = async (req, res) => {
  res.status(201).json(await vacinacao.aplicarEmLote(vacinacaoLoteSchema.parse(req.body)));
};

exports.registrarOcorrencia = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  res.status(201).json(await registro.registrarOcorrencia(id, ocorrenciaSchema.parse(req.body)));
};

exports.registrarTratamento = async (req, res) => {
  const id = idSchema.parse(req.params.id);
  res.status(201).json(await registro.registrarTratamento(id, tratamentoSchema.parse(req.body)));
};
