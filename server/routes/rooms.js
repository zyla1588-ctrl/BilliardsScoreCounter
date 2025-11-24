const Router = require('koa-router');
const { Room, User, RoomPlayer } = require('../models');
const { Op } = require('sequelize');

const router = new Router();

// 生成6位房间码
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 创建房间
router.post('/', async (ctx) => {
  try {
    const { name, max_players } = ctx.request.body;
    const userId = ctx.state.user.id;

    // 确保 max_players 是数字
    const maxPlayersNum = parseInt(max_players) || 4;
    
    // 验证参数
    if (!name || name.trim().length === 0) {
      ctx.status = 400;
      ctx.body = { error: '房间名称不能为空' };
      return;
    }

    if (maxPlayersNum < 2 || maxPlayersNum > 8) {
      ctx.status = 400;
      ctx.body = { error: '房间人数必须在2-8人之间' };
      return;
    }

    // 生成房间码
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 创建房间
    const room = await Room.create({
      name: name.trim(),
      code: roomCode,
      creator_id: userId,
      max_players: maxPlayersNum,
      status: 'waiting'
    });

    // 将创建者加入房间
    await RoomPlayer.create({
      room_id: room.id,
      user_id: userId,
      score: 0
    });

    // 获取完整的房间信息，包括创建者信息
    const roomWithDetails = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: RoomPlayer,
          as: 'players',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        }
      ]
    });

    ctx.body = {
      success: true,
      room: roomWithDetails
    };
  } catch (error) {
    console.error('创建房间失败:', error);
    ctx.status = 500;
    ctx.body = { error: '创建房间失败: ' + error.message };
  }
});

// 加入房间 - 修改路由路径
router.post('/:code/join', async (ctx) => {
  try {
    const { code } = ctx.params;
    const userId = ctx.state.user.id;
    
    console.log(`用户 ${userId} 尝试加入房间 ${code}`);
    
    // 查找房间
    const room = await Room.findOne({
      where: { code },
      include: [{
        model: RoomPlayer,
        as: 'players'
      }]
    });

    if (!room) {
      ctx.status = 404;
      ctx.body = { error: '房间不存在' };
      return;
    }

    if (room.status !== 'waiting') {
      ctx.status = 400;
      ctx.body = { error: '房间已开始游戏，无法加入' };
      return;
    }

    // 检查房间是否已满
    if (room.players.length >= room.max_players) {
      ctx.status = 400;
      ctx.body = { error: '房间已满' };
      return;
    }

    // 检查用户是否已在房间中
    const existingPlayer = await RoomPlayer.findOne({
      where: {
        room_id: room.id,
        user_id: userId
      }
    });

    if (existingPlayer) {
      ctx.status = 400;
      ctx.body = { error: '您已在房间中' };
      return;
    }

    // 将用户加入房间
    await RoomPlayer.create({
      room_id: room.id,
      user_id: userId,
      score: 0
    });

    // 获取更新后的房间信息
    const updatedRoom = await Room.findByPk(room.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: RoomPlayer,
          as: 'players',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        }
      ]
    });

    ctx.body = {
      success: true,
      room: updatedRoom,
      message: '成功加入房间'
    };
  } catch (error) {
    console.error('加入房间失败:', error);
    ctx.status = 500;
    ctx.body = { error: '加入房间失败: ' + error.message };
  }
});

// 获取房间信息
router.get('/:code', async (ctx) => {
  try {
    const { code } = ctx.params;
    
    const room = await Room.findOne({
      where: { code },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: RoomPlayer,
          as: 'players',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        }
      ]
    });

    if (!room) {
      ctx.status = 404;
      ctx.body = { error: '房间不存在' };
      return;
    }

    console.log('返回房间信息:', {
      id: room.id,
      name: room.name,
      code: room.code,
      creator_id: room.creator_id,
      status: room.status
    });

    ctx.body = {
      success: true,
      room: room
    };
  } catch (error) {
    console.error('获取房间信息失败:', error);
    ctx.status = 500;
    ctx.body = { error: '获取房间信息失败' };
  }
});

// 开始游戏 - 修改为支持房间码
router.post('/:code/start', async (ctx) => {
  try {
    const { code } = ctx.params;
    const userId = ctx.state.user.id;

    console.log(`用户 ${userId} 尝试开始房间 ${code} 的游戏`);

    const room = await Room.findOne({
      where: { code },
      include: [{
        model: RoomPlayer,
        as: 'players'
      }]
    });

    if (!room) {
      ctx.status = 404;
      ctx.body = { error: '房间不存在' };
      return;
    }

    if (room.creator_id !== userId) {
      ctx.status = 403;
      ctx.body = { error: '只有房主可以开始游戏' };
      return;
    }

    if (room.status !== 'waiting') {
      ctx.status = 400;
      ctx.body = { error: '游戏已开始或已结束' };
      return;
    }

    if (room.players.length < 2) {
      ctx.status = 400;
      ctx.body = { error: '至少需要2名玩家' };
      return;
    }

    // 更新房间状态
    await room.update({ status: 'playing' });

    ctx.body = {
      success: true,
      message: '游戏开始'
    };
  } catch (error) {
    console.error('开始游戏失败:', error);
    ctx.status = 500;
    ctx.body = { error: '开始游戏失败: ' + error.message };
  }
});

// 离开房间 - 修改为支持房间码
router.post('/:code/leave', async (ctx) => {
  try {
    const { code } = ctx.params;
    const userId = ctx.state.user.id;

    console.log(`用户 ${userId} 尝试离开房间 ${code}`);

    // 查找房间
    const room = await Room.findOne({
      where: { code }
    });

    if (!room) {
      ctx.status = 404;
      ctx.body = { error: '房间不存在' };
      return;
    }

    // 删除玩家记录
    const deletedCount = await RoomPlayer.destroy({
      where: {
        room_id: room.id,
        user_id: userId
      }
    });

    if (deletedCount === 0) {
      ctx.status = 400;
      ctx.body = { error: '您不在此房间中' };
      return;
    }

    // 如果是房主离开且房间还有其他玩家，转移房主
    if (room.creator_id === userId) {
      const remainingPlayers = await RoomPlayer.findAll({
        where: { room_id: room.id }
      });

      if (remainingPlayers.length > 0) {
        await room.update({ creator_id: remainingPlayers[0].user_id });
        console.log(`房主转移给用户 ${remainingPlayers[0].user_id}`);
      } else {
        // 没有其他玩家，删除房间
        await room.destroy();
        console.log(`房间 ${code} 已删除（无剩余玩家）`);
      }
    }

    ctx.body = {
      success: true,
      message: '已离开房间'
    };
  } catch (error) {
    console.error('离开房间失败:', error);
    ctx.status = 500;
    ctx.body = { error: '离开房间失败: ' + error.message };
  }
});

module.exports = router; 