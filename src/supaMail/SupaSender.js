const nodemailer = require("nodemailer")

class SupaSender {
    /**
     * @param {Object} connection connection details.
     * @param {string} connection.user username/email.
     * @param {string} connection.password user password.
     * @param {string} connection.host mail provider host/ip address.
     * @param {number} [connection.port=587] mail provider port.
     * @param {string} [inbox=INBOX] name of the inbox.
     */
    constructor(connection) {
        this.client = nodemailer.createTransport({
            host: connection.host,
            port: connection.port ?? 587,
            secure: false, // security is provided by starttls
            auth: {
                user: connection.user,
                pass: connection.password,
            },
        })
    }

    async verifyConnection() {
        await this.client.verify()
    }

    /**
     *
     * @param {EmailMessage} message
     * @returns {Promise<void>}
     */
    async sendMessage(message) {
        message.fromName = message.originalAuthor
        message.fromAddress = message.from
        message.from = {
            name: message.originalAuthor,
            address: message.from,
        }

        message.date = new Date(Date.now())

        if (message.text) {
            message.text += "\n\n"
            message.text += "--------------------------------\n"
            message.text += `This message was sent by ${message.originalAuthor} via SupaMail`
        }

        if (message.html) {
            message.html = message.html.replace("</body>", "")
            message.html = message.html.replace("</html>", "")
            message.html += "<br><br>"
            message.html += "--------------------------------<br>"
            message.html += `This message was sent by ${message.originalAuthor} via SupaMail`
            message.html += "</body></html>"
        }

        return this.client.sendMail(message)
    }
}

module.exports = SupaSender
