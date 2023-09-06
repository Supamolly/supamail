import EmailUser from "./models/EmailUser.js"
import EmailAdmin from "./models/EmailAdmin.js"

import sequelize from "./sequelize.js"

export default {
    EmailAdmin,
    EmailUser,
    sequelize,
}
