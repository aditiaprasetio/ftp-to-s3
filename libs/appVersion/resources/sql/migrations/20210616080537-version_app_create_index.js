'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.sequelize.query(`
      create index app_version_forceupdate on app_versions (("forceUpdate"))
    `),
    queryInterface.sequelize.query(`
      create index app_version_createdat on app_versions (("createdAt"))
    `),
    queryInterface.sequelize.query(`
      create index app_version_forceupdate_updatedat on app_versions (("forceUpdate"), ("createdAt"))
    `),
  ]),

  down: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.sequelize.query(`
      drop index app_version_forceupdate
    `),
    queryInterface.sequelize.query(`
      drop index app_version_createdat
    `),
    queryInterface.sequelize.query(`
      drop index app_version_forceupdate_updatedat
    `),
  ])
};
