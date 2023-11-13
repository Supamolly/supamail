const EmailUser = require("./models/EmailUser.js")
const EmailAdmin = require("./models/EmailAdmin.js")

const sequelize = require("./sequelize.js")

module.exports = {
    EmailAdmin,
    EmailUser,
    sequelize,
}
