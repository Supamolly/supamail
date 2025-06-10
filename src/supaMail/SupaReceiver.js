const Imap = require("imap")
const {simpleParser} = require("mailparser")

class SupaReceiver {
    /**
     * @param {Object} connection connection details.
     * @param {string} connection.user username/email.
     * @param {string} connection.password user password.
     * @param {string} connection.host mail provider host/ip address.
     * @param {number} [connection.port=993] mail provider port.
     * @param {boolean} [connection.tls=true] should tls be used.
     * @param {string} [inbox=INBOX] name of the inbox.
     */
    constructor(connection, inbox = "INBOX") {
        const useTls = connection.tls ?? true
        const port = useTls === true ? 993 : 143

        this.imap = new Imap({...connection, port: port, tls: useTls})
        this.imap.once("end", () => { this.connected = false })

        this.inbox = inbox
        this.connected = false
    }

    /**
     * Connects to the IMAP server and opens the inbox
     * @returns {Promise<undefined>}
     */
    async connectAndOpenInbox() {
        return new Promise((resolve, reject) => {
            if (this.connected === true) return resolve()

            this.imap.once("ready", async() => {
                this.connected = true
                await this.openInbox()
                resolve()
            })

            this.imap.once("error", err => {
                reject(err)
            })

            this.imap.connect()
        })
    }
    async openInbox() {
        return new Promise((resolve, reject) => {
            this.imap.openBox(this.inbox, false, (err, box) => {
                if (err) return reject(err)
                resolve(box)
            })
        })
    }

    disconnect() {
        this.imap.end()
    }

    /**
     * Fetches a message with a given ID from the inbox.
     *
     * @param {number} messageId The ID of the message.
     * @returns {Promise<EmailMessage>} The email message object.
     */
    async fetchMessage(messageId) {
        await this.connectAndOpenInbox()
        const f = this.imap.fetch([messageId], {bodies: ""})

        return new Promise((resolve, reject) => {
            let buffer = ""
            f.on("message", msg => {
                msg.on("body", stream => {
                    stream.on("data", chunk => {
                        buffer += chunk.toString("utf8")
                    })
                })

                msg.on("error", err => reject(err))

                msg.once("end", () => {
                    simpleParser(buffer, (err, parsed) => {
                        if (err) return reject(err)
                        const message = {
                            messageId: parsed.messageId,
                            inReplyTo: parsed.inReplyTo,
                            date: Date.parse(parsed.date),
                            subject: parsed.subject,
                            text: parsed.text,
                            html: parsed.html,
                            to: parsed.to.text,
                            from: parsed.from.text,
                            fromName: parsed.from.value[0].name,
                            fromAddress: parsed.from.value[0].address,
                            attachments: parsed.attachments,
                        }
                        resolve(message)
                    })
                })
            })
        })
    }

    /**
     * Gets message IDs filtered by criteria.
     *
     * @param {[string]} [criteria=["UNSEEN"]] Criteria to filter messages. See https://github.com/mscdex/node-imap a list of possible criteria.
     * @returns {Promise<Array<number>>} Array with message IDs, that match the given criteria.
     */
    async getMailIds(criteria = ["UNSEEN"]) {
        await this.connectAndOpenInbox()

        return new Promise((resolve, reject) => {
            this.imap.search(criteria, (err, results) => {
                if (err) return reject(err)
                resolve(results)
            })
        })
    }

    /**
     * Add flags to a message.
     *
     * @param {number} messageId MailboxID of the message. See https://github.com/mscdex/node-imap for a list of possible flags.
     * @param {[string]} flags Flags to add to the message.
     * @returns {Promise<>}
     */
    async addFlags(messageId, flags) {
        return new Promise((resolve, reject) => {
            this.imap.addFlags(messageId, flags, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }
}

module.exports = SupaReceiver
