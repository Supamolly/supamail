// const logger = require("../util/logger.js")
const {Sequelize} = require("sequelize")

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: "mariadb",
    host: process.env.DB_HOST,
    // logging: logger.debug.bind(logger),
})
module.exports = sequelize
