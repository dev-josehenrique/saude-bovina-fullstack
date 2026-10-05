const { Router } = require('express');
const auth = require('../middlewares/auth');
const authCtrl = require('../controllers/auth.controller');
const bovinoCtrl = require('../controllers/bovino.controller');
const piqueteCtrl = require('../controllers/piquete.controller');
const veterinarioCtrl = require('../controllers/veterinario.controller');
const tratamentoCtrl = require('../controllers/tratamento.controller');
const catalogoCtrl = require('../controllers/catalogo.controller');

const router = Router();

// Express 4 não captura rejeições de handlers async: este wrapper encaminha o erro ao middleware central.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Públicas
router.post('/auth/register', wrap(authCtrl.registrar));
router.post('/auth/login', wrap(authCtrl.login));

// Protegidas (JWT obrigatório)
router.use(auth);
router.get('/auth/me', wrap(authCtrl.me));

router.get('/bovinos', wrap(bovinoCtrl.listar));
router.post('/bovinos', wrap(bovinoCtrl.criar));
router.get('/bovinos/:id', wrap(bovinoCtrl.buscarPorId));
router.put('/bovinos/:id', wrap(bovinoCtrl.atualizar));
router.delete('/bovinos/:id', wrap(bovinoCtrl.remover));
router.post('/bovinos/:id/pesagens', wrap(bovinoCtrl.registrarPesagem));
router.post('/bovinos/:id/historico', wrap(tratamentoCtrl.registrarOcorrencia));
router.post('/bovinos/:id/tratamentos', wrap(tratamentoCtrl.registrarTratamento));

router.get('/piquetes', wrap(piqueteCtrl.listar));
router.post('/piquetes', wrap(piqueteCtrl.criar));
router.get('/piquetes/:id', wrap(piqueteCtrl.buscarPorId));
router.get('/veterinarios', wrap(veterinarioCtrl.listar));
router.post('/veterinarios', wrap(veterinarioCtrl.criar));
router.get('/veterinarios/:id', wrap(veterinarioCtrl.buscarPorId));
router.put('/veterinarios/:id', wrap(veterinarioCtrl.atualizar));

router.get('/racas', wrap(catalogoCtrl.racas));
router.get('/propriedades', wrap(catalogoCtrl.propriedades));
router.get('/vacinas', wrap(catalogoCtrl.vacinas));
router.get('/tratamentos', wrap(tratamentoCtrl.listar));
router.get('/tipos-tratamento', wrap(tratamentoCtrl.tipos));
router.post('/vacinacoes/lote', wrap(tratamentoCtrl.vacinarLote));
router.get('/doencas', wrap(tratamentoCtrl.doencas));
router.get('/medicamentos', wrap(tratamentoCtrl.medicamentos));

router.get('/relatorios/veterinarios', wrap(catalogoCtrl.relatorioVeterinarios));
router.get('/relatorios/peso-medio', wrap(catalogoCtrl.relatorioPesoMedio));
router.get('/relatorios/lotacao-piquetes', wrap(catalogoCtrl.relatorioLotacao));

module.exports = router;
