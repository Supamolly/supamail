import "dotenv/config"
import SupaMail from "./src/supaMail/SupaMail.js"
import logger from "./src/util/logger.js"
import express from "express"
import cors from "cors"
import routes from "./src/api/routes/index.js"
import db from "./src/db/index.js"

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

    logger.info("Starting SupaMail")

    const distributors = ["supa", "ton", "licht", "hoerliste", "tech"]

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

    for (const distributor of distributors) {
        const mailer = new SupaMail(distributor)
        setInterval(async() => {
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
