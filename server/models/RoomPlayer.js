const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomPlayer = sequelize.define('RoomPlayer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'room_players',
    timestamps: true,
    underscored: true
  });

  return RoomPlayer;
}; 