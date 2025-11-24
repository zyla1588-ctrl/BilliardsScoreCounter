const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const User = require('./User')(sequelize);
const Room = require('./Room')(sequelize);
const RoomPlayer = require('./RoomPlayer')(sequelize);
const ScoreLog = require('./ScoreLog')(sequelize);

// 关联关系
Room.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
Room.hasMany(RoomPlayer, { as: 'players', foreignKey: 'room_id' });

User.hasMany(RoomPlayer, { as: 'roomPlayers', foreignKey: 'user_id' });
RoomPlayer.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
RoomPlayer.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });

ScoreLog.belongsTo(User, { as: 'fromUser', foreignKey: 'from_user' });
ScoreLog.belongsTo(User, { as: 'toUser', foreignKey: 'to_user' });
ScoreLog.belongsTo(Room, { as: 'room', foreignKey: 'room_id' });

module.exports = {
  sequelize,
  User,
  Room,
  RoomPlayer,
  ScoreLog
}; 