const Router = require('koa-router');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = new Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 用户注册
router.post('/register', async (ctx) => {
  try {
    const { username, password, nickname } = ctx.request.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { error: '用户名已存在' };
      return;
    }

    // 暂时不加密密码
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      password, // 直接使用明文密码
      nickname: nickname || username
    });

    // 生成JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    ctx.body = {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    ctx.status = 500;
    ctx.body = { error: '注册失败: ' + error.message };
  }
});

// 用户登录
router.post('/login', async (ctx) => {
  try {
    const { username, password } = ctx.request.body;
    console.log('Login attempt:', { username, password: '***' });

    // 查找用户
    const user = await User.findOne({ where: { username } });
    console.log('User found:', user ? { id: user.id, username: user.username, stored_password: user.password } : 'Not found');
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: '用户名或密码错误' };
      return;
    }

    // 打印类型信息
    console.log('Password types:', {
      input: typeof password,
      inputValue: password,
      db: typeof user.password,
      dbValue: user.password,
      directCompare: password === user.password,
      typeConvertedCompare: String(password) === String(user.password)
    });
    
    const isMatch = String(password) === String(user.password);
    if (!isMatch) {
      ctx.status = 401;
      ctx.body = { error: '用户名或密码错误' };
      return;
    }

    // 生成JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    ctx.body = {
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    };
    console.log('Login successful for user:', user.username);
  } catch (error) {
    console.error('登录失败:', error);
    ctx.status = 500;
    ctx.body = { error: '登录失败: ' + error.message };
  }
});

// 获取当前用户信息
router.get('/user', async (ctx) => {
  try {
    // 手动验证 token
    const token = ctx.headers.authorization?.split(' ')[1];
    if (!token) {
      ctx.status = 401;
      ctx.body = { error: '未提供认证令牌' };
      return;
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      ctx.status = 401;
      ctx.body = { error: '无效的认证令牌' };
      return;
    }
    
    const userId = decoded.id;
    console.log('User ID from token:', userId);

    const user = await User.findByPk(userId);
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: '用户不存在' };
      return;
    }

    ctx.body = {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ctx.status = 500;
    ctx.body = { error: '获取用户信息失败: ' + error.message };
  }
});

// 临时添加调试路由，生产环境中删除
router.get('/debug-users', async (ctx) => {
  const users = await User.findAll({
    attributes: ['id', 'username', 'password', 'nickname']
  });
  ctx.body = users;
});

module.exports = router; 