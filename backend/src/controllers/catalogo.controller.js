// Controller de consultas auxiliares (raças, propriedades, vacinas) e dos relatórios.
const service = require('../services/catalogo.service');
const relatorios = require('../services/relatorio.service');

// Gera um handler de leitura para uma função de serviço.
const ler = (fn) => async (req, res) => res.json(await fn());

exports.racas = ler(service.racas);
exports.propriedades = ler(service.propriedades);
exports.vacinas = ler(service.vacinas);

exports.relatorioVeterinarios = ler(relatorios.animaisPorVeterinario);
exports.relatorioPesoMedio = ler(relatorios.pesoMedioAdultos);
exports.relatorioLotacao = ler(relatorios.historicoLotacao);
