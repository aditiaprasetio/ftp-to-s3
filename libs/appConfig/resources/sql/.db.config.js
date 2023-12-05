require('dotenv').config({
  path: process.env.ENV_PATH,
});

module.exports = {
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'mariadb',

    dialectOptions: {
      pool: {
        min: 0,
        max: 10,
        acquire: 10,
        idle: 5,
      },
    },
  },
  local: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'comika',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'mariadb',

    dialectOptions: {
      pool: {
        min: 0,
        max: 10,
        acquire: 10,
        idle: 5,
      },
    },
  },
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'mariadb',

    dialectOptions: {
      pool: {
        min: 0,
        max: 10,
        acquire: 10,
        idle: 5,
      },
    },
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'mariadb',

    dialectOptions: {
      pool: {
        min: 0,
        max: 10,
        acquire: 10,
        idle: 5,
      },
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'mariadb',

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      pool: {
        min: 0,
        max: 10,
        acquire: 10,
        idle: 5,
      },
    },
  },
};

