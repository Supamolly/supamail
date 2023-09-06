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
    const distributors = ["supa"]
    const promises = []
    for (const distributor of distributors) {
        const mailer = new SupaMail(distributor)
        setInterval(async() => {
            await mailer.runDistributor()
        }, 5000)
    }
}

run()
