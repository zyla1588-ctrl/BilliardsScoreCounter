const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: true
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_players: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    status: {
      type: DataTypes.ENUM('waiting', 'playing', 'ended'),
      defaultValue: 'waiting'
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'rooms',
    timestamps: true,
    underscored: true
  });

  return Room;
}; 