const dotEnv = require("dotenv-defaults")
dotEnv.config()

const express = require("express")
const {setIntervalAsync} = require("set-interval-async")

const SupaMail = require("./src/supaMail/SupaMail.js")
const logger = require("./src/util/logger.js")
const routes = require("./src/api/routes/index.js")
const db = require("./src/db/index.js")

global.debug = process.argv.includes("debug")

const app = express()
app.use(express.json())

Object.keys(routes).forEach(route => {
    app.use(`/api/${route}`, routes[route])
})

const expressPort = process.env.port || 5000
app.listen(expressPort, () => {
    logger.info(`Express API listening on port ${expressPort}`)
})

async function run() {
    logger.info("Syncing database")
    await db.sequelize.sync()

    process.on("unhandledRejection", err => {
        if (err instanceof Error) {
            logger.error(`Detected unhandled promise rejection: ${err.stack}`)
        } else {
            logger.error(`Detected unhandled promise rejection with non-Error value: ${err}`)
        }
    })

    process.on("uncaughtException", (err, origin) => {
        if (err instanceof Error) {
            logger.error(`Detected ${origin} ${err.stack}`)
        } else {
            logger.error(`Detected $\{origin} with non-Error value: ${err}`)
        }
    })

    logger.info("Starting SupaMail")
    const distributors = ["supa", "ton", "licht", "hoerliste", "tech", "it", "test"]
    for (const distributor of distributors) {
        let mailer = null
        try {
            mailer = new SupaMail(distributor)
        } catch (err) {
            logger.error(`Could not initialize ${distributor} distributor due to ${err.stack}`)
            continue
        }

        setIntervalAsync(async() => {
            try {
                await mailer.runDistributor()
            } catch (err) {
                logger.error(`Unhandled Error on runDistributor() ${err.stack}`)
            }
        }, 5000)
    }
}

run().catch(err => {
    logger.error(`Unhandled Error on main thread: ${err.stack}`)
})
