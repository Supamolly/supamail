const {DataTypes} = require("sequelize")
const sequelize = require("../sequelize.js")

const EmailUser = sequelize.define("EmailUser", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
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

    it: {
        type: DataTypes.BOOLEAN,
    },
}, {tableName: "supamolly_vert"})

module.exports = EmailUser
