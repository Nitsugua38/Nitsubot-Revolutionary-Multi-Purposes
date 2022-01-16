const Sequelize = require("sequelize");

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'db1.sqlite',
});

const Tags = sequelize.define('tags', {
    guildid: {
        type: Sequelize.STRING,
        unique: true,
    },
    tccateg: {
        type: Sequelize.TEXT,
    },
    wheretoreply: {
        type: Sequelize.TEXT,
    },
    wheretocontactstaff: {
        type: Sequelize.TEXT,
    },
});

module.exports = Tags;