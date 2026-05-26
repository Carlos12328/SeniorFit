'use strict';
const service = require('../services/frequenciaService');
const { responderResultado } = require('./baseController');
async function consultar(req, res) { return responderResultado(res, await service.consultarFrequencia(req.query, req.usuario), 200, 'Frequência consultada com sucesso'); }
module.exports = { consultar };
