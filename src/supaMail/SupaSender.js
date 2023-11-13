const emailjs = require("emailjs")

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

        this.client = new SMTPClient({
            user: connection.user,
            password: connection.password,
            host: connection.host,
            ssl: useTls,
        })
    }

    /**
     *
     * @param {EmailMessage} message
     * @returns {Promise<void>}
     */
    async sendMessage(message) {
        const msg = {
            text: message.text,
            to: message.to,
            from: message.from,
            subject: message.subject,
            attachment: [],
        }

        if (message.bcc) msg.bcc = message.bcc
        if (message.inReplyTo) msg["In-Reply-To"] = message.inReplyTo
        if (message.html) msg.attachment.push({data: message.html, alternative: true})

        message.attachments.forEach(attachment => {
            msg.attachment.push({
                data: attachment.content,
                type: attachment.contentType,
                headers: attachment.headers,
                name: attachment.filename,
            })
        })

        return this.client.sendAsync(msg)
    }
}

module.exports = SupaSender
