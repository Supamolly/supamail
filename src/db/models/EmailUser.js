import {DataTypes} from "sequelize"
import sequelize from "../db.js"

const EmailUser = sequelize.define("EmailUser", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    ton: {
        type: DataTypes.BOOLEAN,
    },

    licht: {
        type: DataTypes.BOOLEAN,
    },

    tech: {
        type: DataTypes.BOOLEAN,
    },

    supa: {
        type: DataTypes.BOOLEAN,
    },

    hoerliste: {
        type: DataTypes.BOOLEAN,
    },

    fusion: {
        type: DataTypes.BOOLEAN,
    },
}, {tableName: "supamolly_vert"})

export default EmailUser
