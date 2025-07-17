require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');


const connectDB = require('./config/db');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middleware/errorHandler');

// Inicializar app Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
const allowedOrigins = ['http://localhost:3000', 'null'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
connectDB();

// Inicializar cliente WhatsApp
const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  authStrategy: new LocalAuth({ clientId: 'whatsapp-business-dashboard' }),
});

// Eventos do WhatsApp
const qrcode = require('qrcode-terminal');

client.on('qr', (qr) => {
  console.log('\n======= QR Code: =======\n');
  qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
  logger.info('Cliente WhatsApp está pronto');
  io.emit('whatsapp-status', { status: 'ready' });
});

client.on('authenticated', () => {
  logger.info('Cliente WhatsApp autenticado');
  io.emit('whatsapp-status', { status: 'authenticated' });
});

client.on('auth_failure', (msg) => {
  logger.error(`Falha na autenticação do WhatsApp: ${msg}`);
  io.emit('whatsapp-status', { status: 'auth_failure', message: msg });
});

client.on('disconnected', (reason) => {
  logger.warn(`Cliente WhatsApp desconectado: ${reason}`);
  io.emit('whatsapp-status', { status: 'disconnected', reason });
});

client.on('message', (message) => {
  logger.info(`Nova mensagem recebida: ${message.body}`);
  io.emit('whatsapp-message', { message });
});

// Inicializar cliente WhatsApp
client.initialize().catch((err) => {
  logger.error(`Erro ao inicializar cliente WhatsApp: ${err.message}`);
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/users', userRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando',
    whatsappStatus: client.info ? 'connected' : 'disconnected',
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// Exportar para testes
module.exports = { app, server, client };