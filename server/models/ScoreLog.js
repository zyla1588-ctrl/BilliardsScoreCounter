const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ScoreLog = sequelize.define('ScoreLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    to_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'score_logs',
    timestamps: true,
    underscored: true
  });

  return ScoreLog;
}; 