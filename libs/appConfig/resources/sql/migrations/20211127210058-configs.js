'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('app_configs', {
      configId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.STRING
      },
      key: {
        type: Sequelize.DataTypes.STRING,
        unique: true,
      },
      value: {
        type: Sequelize.DataTypes.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    })
  },

  down: async (queryInterface, Sequelize) => 
    await queryInterface.dropTable('app_configs')
};
