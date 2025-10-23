const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('eco_fashion_db', 'tu_usuario', 'tu_contraseña', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
