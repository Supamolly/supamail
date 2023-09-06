import "dotenv/config"
import SupaMail from "./src/supaMail/SupaMail.js"
import logger from "./src/util/logger.js"

async function run() {
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
