'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { erro } = require('./utils/responses');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(require('./routes/authRoutes'));
app.use(require('./routes/usuariosRoutes'));
app.use(require('./routes/idososRoutes'));
app.use(require('./routes/atividadesRoutes'));
app.use(require('./routes/frequenciaRoutes'));

app.get('/health', (req, res) => res.json({ status: 'sucesso', mensagem: 'SeniorFit API ativa' }));
app.get('/', (req, res) => res.redirect('/login.html'));
app.use((req, res) => erro(res, 404, 'Rota não encontrada', 'ROTA_NAO_ENCONTRADA'));
app.use((err, req, res, next) => {
  console.error(err);
  return erro(res, 500, 'Erro interno do servidor', 'ERRO_INTERNO');
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`SeniorFit rodando em http://localhost:${port}`));
}

module.exports = app;
