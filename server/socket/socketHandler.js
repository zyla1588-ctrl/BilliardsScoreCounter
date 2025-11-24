const { Room, User, RoomPlayer, ScoreLog } = require('../models');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // 用于存储房间信息
  }

  handleConnection(socket) {
    console.log('Client connected:', socket.id);

    // 获取用户信息
    const token = socket.handshake.auth.token;
    let userId = null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        console.log('Authenticated user connected:', userId);
      } catch (error) {
        console.error('Invalid token:', error.message);
      }
    }

    // 设置用户ID
    socket.userId = userId;

    // 加入房间
    socket.on('join_room', (data) => this.handleJoinRoom(socket, data));

    // 离开房间
    socket.on('leave_room', (data) => this.handleLeaveRoom(socket, data));

    // 开始游戏
    socket.on('start_game', (data) => this.handleStartGame(socket, data));

    // 更新分数
    socket.on('update_score', (data) => this.handleUpdateScore(socket, data));

    // 结束游戏
    socket.on('end_game', (data) => this.handleEndGame(socket, data));

    // 断开连接
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  // 处理加入房间
  async handleJoinRoom(socket, data) {
    const { roomCode, userId } = data;
    console.log(`User ${userId} joining room ${roomCode}`);

    try {
      // 获取用户信息
      const user = await User.findByPk(userId);
      if (!user) {
        socket.emit('error', { message: '用户不存在' });
        return;
      }

      // 将房间信息存储到Map中
      if (!this.rooms.has(roomCode)) {
        console.log(`Creating new room: ${roomCode}`);
        this.rooms.set(roomCode, {
          players: new Map(), // 改为Map存储用户详细信息
          status: 'waiting'
        });
      }

      const room = this.rooms.get(roomCode);
      room.players.set(userId, {
        id: userId,
        username: user.username,
        score: 0
      });

      // 加入Socket.io房间
      socket.join(roomCode);
      
      // 保存当前房间码到socket对象
      socket.currentRoom = roomCode;

      // 向房间广播新玩家加入
      const players = Array.from(room.players.values());
      this.io.to(roomCode).emit('room_joined', {
        userId,
        players,
        message: `${user.username} 加入了房间`
      });

      console.log(`Room ${roomCode} now has ${players.length} players:`, players);
    } catch (error) {
      console.error('加入房间失败:', error);
      socket.emit('error', { message: '加入房间失败' });
    }
  }

  // 处理离开房间
  handleLeaveRoom(socket, data) {
    const { roomCode } = data;
    const userId = socket.userId;
    
    console.log(`User ${userId} leaving room ${roomCode}`);

    if (!this.rooms.has(roomCode)) {
      console.error(`Room ${roomCode} does not exist`);
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const room = this.rooms.get(roomCode);
    const leavingPlayer = room.players.get(userId);
    room.players.delete(userId);

    // 离开Socket.io房间
    socket.leave(roomCode);
    
    // 清除当前房间记录
    socket.currentRoom = null;

    // 如果房间没有玩家，删除房间
    if (room.players.size === 0) {
      this.rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (no players)`);
    } else {
      // 向房间广播玩家离开
      const players = Array.from(room.players.values());
      this.io.to(roomCode).emit('room_left', {
        userId,
        players,
        message: `${leavingPlayer?.username || userId} 离开了房间`
      });

      console.log(`Room ${roomCode} now has ${players.length} players:`, players);
    }
  }

  // 处理开始游戏
  handleStartGame(socket, data) {
    const { roomCode } = data;
    console.log(`Starting game in room ${roomCode}`);

    if (!this.rooms.has(roomCode)) {
      console.error(`Room ${roomCode} does not exist`);
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const room = this.rooms.get(roomCode);
    room.status = 'playing';

    // 广播游戏开始
    this.io.to(roomCode).emit('game_started', {
      roomCode,
      message: 'Game started'
    });
  }

  // 处理更新分数
  async handleUpdateScore(socket, data) {
    const { roomCode, targetUserId, points, action } = data;
    const operatorUserId = socket.userId;
    
    console.log(`User ${operatorUserId} updating score for user ${targetUserId} in room ${roomCode}: ${points} points`);

    if (!this.rooms.has(roomCode)) {
      console.error(`Room ${roomCode} does not exist`);
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    try {
      const room = this.rooms.get(roomCode);
      const operator = room.players.get(operatorUserId);
      const target = room.players.get(targetUserId);

      if (!operator || !target) {
        socket.emit('error', { message: '玩家不在房间中' });
        return;
      }

      // 更新分数
      target.score += points;
      room.players.set(targetUserId, target);

      // 根据分数创建不同的描述
      let scoreDescription = '';
      switch(points) {
        case 1:
          scoreDescription = '1分';
          break;
        case 4:
          scoreDescription = '4分普盛';
          break;
        case 7:
          scoreDescription = '7分小金';
          break;
        case 10:
          scoreDescription = '10分大金';
          break;
        default:
          scoreDescription = `${points}分`;
      }

      // 创建日志信息
      const logMessage = operatorUserId === targetUserId 
        ? `${operator.username} 获得了 ${scoreDescription}`
        : `${operator.username} 为 ${target.username} 记录了 ${scoreDescription}`;

      // 广播分数更新
      this.io.to(roomCode).emit('score_updated', {
        roomCode,
        operatorId: operatorUserId,
        operatorName: operator.username,
        targetId: targetUserId,
        targetName: target.username,
        points,
        newScore: target.score,
        action,
        message: logMessage,
        timestamp: Date.now(),
        players: Array.from(room.players.values()) // 发送所有玩家的最新分数
      });

    } catch (error) {
      console.error('更新分数失败:', error);
      socket.emit('error', { message: '更新分数失败' });
    }
  }

  // 处理结束游戏
  handleEndGame(socket, data) {
    const { roomCode, scores } = data;
    console.log(`Ending game in room ${roomCode}`);

    if (!this.rooms.has(roomCode)) {
      console.error(`Room ${roomCode} does not exist`);
      socket.emit('error', { message: '房间不存在' });
      return;
    }

    const room = this.rooms.get(roomCode);
    room.status = 'ended';

    // 广播游戏结束
    this.io.to(roomCode).emit('game_ended', {
      roomCode,
      scores,
      message: 'Game ended'
    });
  }

  // 处理断开连接
  handleDisconnect(socket) {
    const userId = socket.userId;
    const roomCode = socket.currentRoom;
    console.log(`Client disconnected: ${socket.id}, userId: ${userId}, room: ${roomCode}`);

    // 如果用户在房间中，处理离开房间
    if (roomCode && this.rooms.has(roomCode)) {
      const room = this.rooms.get(roomCode);
      room.players.delete(userId);

      // 如果房间没有玩家，删除房间
      if (room.players.size === 0) {
        this.rooms.delete(roomCode);
        console.log(`Room ${roomCode} deleted (no players after disconnect)`);
      } else {
        // 向房间广播玩家离开
        const players = Array.from(room.players.values());
        this.io.to(roomCode).emit('room_left', {
          userId,
          players,
          message: `User ${userId} disconnected`
        });

        console.log(`Room ${roomCode} now has ${players.length} players:`, players);
      }
    }
  }
}

module.exports = SocketHandler; 