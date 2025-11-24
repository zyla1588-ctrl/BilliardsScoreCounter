require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mysql_yAQ2Xf',
    database: process.env.DB_NAME || 'billiard_score',
    host: process.env.DB_HOST || '47.119.149.236',
    dialect: 'mysql',
    timezone: '+08:00'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '+08:00'
  }
}; 