const SupaReceiver = require("./SupaReceiver.js")
const SupaSender = require("./SupaSender.js")
const EmailUser = require("../db/models/EmailUser.js")
const logger = require("../util/logger.js")

class SupaMail {
    /**
     * @param {"supa"|"ton"|"licht"|"tech"|"hoerliste"|"fusion"} distributorType
     */
    constructor(distributorType) {
        this.connectionDetails = {
            host: process.env.MAIL_HOST,
            user: process.env[`${distributorType.toUpperCase()}_EMAIL`],
            password: process.env[`${distributorType.toUpperCase()}_PASSWORD`],
        }

        if (!this.connectionDetails.user || !this.connectionDetails.password) {
            throw new Error("No authentication details available")
        }

        this.distributorType = distributorType
        this.sender = new SupaSender(this.connectionDetails)
        this.receiver = new SupaReceiver(this.connectionDetails)
    }

    async runDistributor() {
        logger.debug("Checking for new emails", {module: `supamail.${this.distributorType}`})

        const userEmails = (await EmailUser.findAll({attributes: ["email"], where: {[this.distributorType]: 1}, raw: true})).map(user => user.email)
        const newMessageIds = await this.receiver.getMailIds()

        logger.debug(`Found ${newMessageIds.length}`, {module: `supamail.${this.distributorType}`})

        const sentMessages = []
        for (const id of newMessageIds) {
            try {
                const message = await this.receiver.fetchMessage(id)
                const originalAuthor = await EmailUser.findOne({where: {email: message.fromAddress}})
                const isAllowedToSend = message.fromAddress.endsWith("@supamolly.de") || originalAuthor !== null

                if (!isAllowedToSend) {
                    logger.info(`Found message from sender ${message.fromAddress}, who is not in the mailing list`, {module: `supamail.${this.distributorType}`})
                    continue
                }

                for (const email of userEmails) {
                    logger.info(`Sending ${message.subject} to ${email}`, {module: `supamail.${this.distributorType}`})
                    sentMessages.push(this.sender.sendMessage({...message, to: email, from: this.connectionDetails.user, originalAuthor: originalAuthor.name}))
                }
            } catch (err) {
                logger.error(err.message, {module: `supamail.${this.distributorType}`})
            }
        }

        await Promise.all(sentMessages)

        for (const id of newMessageIds) {
            await this.receiver.addFlags(id, ["Seen"])
        }
    }
}

module.exports = SupaMail
/**
 * @typedef {Object} EmailAttachment
 * @property {string} filename (if available) file name of the attachment.
 * @property {string} contentType MIME type of the message.
 * @property {string} contentDisposition content disposition type for the attachment, most probably “attachment”.
 * @property {string} checksum a MD5 hash of the message content.
 * @property {number} size message size in bytes.
 * @property {Map} headers a Map value that holds MIME headers for the attachment node.
 * @property {Buffer} content a Buffer that contains the attachment contents.
 * @property {string} contentId the header value from ‘Content-ID’ (if present).
 * @property {string} cid contentId without < and >.
 * @property {boolean} related if true then this attachment should not be offered for download (at least not in the main attachments list).
*/

/**
 * @typedef {Object} EmailMessage
 * @property {number} messageId ID of the message in the mailbox.
 * @property {string} inReplyTo is the In-Reply-To value.
 * @property {string} from Full sender information with name and address as text.
 * @property {string} fromName Name of the sender.
 * @property {string} fromAddress Address of the sender.
 * @property {[string]} to Mail address(es) of the recipient(s).
 * @property {number} date Timestamp of the date and time the message was sent.
 * @property {string} subject Subject of the message.
 * @property {string} text Text of the message.
 * @property {string} html HTML body of the message.
 * @property {[EmailAttachment]} attachments Array of attachments.
 * @property {string} originalAuthor Name of the original author.
 */
