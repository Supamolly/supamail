const nodemailer = require("nodemailer")

class SupaSender {
    /**
     * @param {Object} connection connection details.
     * @param {string} connection.user username/email.
     * @param {string} connection.password user password.
     * @param {string} connection.host mail provider host/ip address.
     * @param {number} [connection.port=465] mail provider port.
     * @param {boolean} [connection.tls=true] should tls be used.
     * @param {string} [inbox=INBOX] name of the inbox.
     */
    constructor(connection) {
        const useTls = connection.tls ?? true

        this.client = nodemailer.createTransport({
            host: connection.host,
            port: connection.port ?? 465,
            secure: useTls,
            auth: {
                user: connection.user,
                pass: connection.password,
            },
        })
    }

    /**
     *
     * @param {EmailMessage} message
     * @returns {Promise<void>}
     */
    async sendMessage(message) {
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
