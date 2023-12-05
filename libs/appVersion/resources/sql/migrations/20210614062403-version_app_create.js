'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('app_versions', {
      appVersionId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      androidVersion: {
        type: Sequelize.STRING
      },
      iosVersion: {
        type: Sequelize.STRING
      },
      forceUpdate: {
        type: Sequelize.BOOLEAN
      },
      adminMetadata: {
        type: Sequelize.JSONB
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      },
    });
  },

  down: async (queryInterface, Sequelize) =>
    await queryInterface.dropTable('app_versions'),
};
