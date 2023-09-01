import "dotenv/config"
import SupaMail from "./supaMail/SupaMail.js"

async function run() {
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
