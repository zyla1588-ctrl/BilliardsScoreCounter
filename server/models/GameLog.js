const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GameLog = sequelize.define('GameLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    roomId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'game_logs',
    timestamps: true
  });

  return GameLog;
}; 