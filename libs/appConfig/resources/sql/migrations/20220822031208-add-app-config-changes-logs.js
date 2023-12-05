'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('app_configs_changes_logs', {
      historyId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
      key: {
        type: Sequelize.DataTypes.STRING,
      },
      newData: {
        type: Sequelize.DataTypes.JSONB,
      },
      createdByUserId: {
        type: Sequelize.DataTypes.STRING,
      },
      metaCreatedByUser: {
        type: Sequelize.DataTypes.JSONB,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) =>
    queryInterface.dropTable('app_configs_changes_logs'),
};
