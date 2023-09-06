import {DataTypes} from "sequelize"
import sequelize from "../sequelize.js"
import bcrypt from "bcrypt"

const EmailAdmin = sequelize.define("EmailAdmin", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    isOp: {
        type: DataTypes.BOOLEAN,
        default: false,
        allowNull: false,
    },
}, {tableName: "supamolly_mail-admin"})

EmailAdmin.beforeCreate(user => bcrypt.hash(user.password, 10).then(hash => {
    user.password = hash
}))

export default EmailAdmin
