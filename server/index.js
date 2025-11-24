const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const jwt = require('koa-jwt');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const gameRoutes = require('./routes/game');
const SocketHandler = require('./socket/socketHandler');

const app = new Koa();
const router = new Router();
const server = createServer(app.callback());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件
app.use(cors());
app.use(bodyParser());

// JWT 中间件（排除认证路由）
app.use(jwt({ secret: JWT_SECRET }).unless({ 
  path: [/^\/api\/register/, /^\/api\/login/, /^\/api\/debug-users/]
}));

// 路由
router.use('/api', authRoutes.routes());
router.use('/api/rooms', roomRoutes.routes());
router.use('/api/game', gameRoutes.routes());

app.use(router.routes());
app.use(router.allowedMethods());

// Socket.io 处理
const socketHandler = new SocketHandler(io);
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

// 启动服务器
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 不同步数据库，使用现有表结构
    console.log('使用现有数据库表结构');
    
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
}

startServer(); 