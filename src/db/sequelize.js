import logger from "../util/logger"
import {Sequelize} from "sequelize"

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: "mysql",
    host: process.env.DB_HOST,
    logging: logger.debug.bind(logger),
})
export default sequelize
