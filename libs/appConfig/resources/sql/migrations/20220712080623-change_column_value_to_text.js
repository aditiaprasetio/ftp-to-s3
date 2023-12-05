'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('app_configs', 'value', {
      allowNull: true,
      type: Sequelize.DataTypes.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('app_configs', 'value', {
      allowNull: false,
      type: Sequelize.DataTypes.STRING,
    });
  },
};
