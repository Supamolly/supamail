import SupaReceiver from "./SupaReceiver.js"
import SupaSender from "./SupaSender.js"
import EmailUser from "../db/models/EmailUser.js"
import logger from "../util/logger.js"

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

        this.distributorType = distributorType
        this.sender = new SupaSender(this.connectionDetails)
        this.receiver = new SupaReceiver(this.connectionDetails)
    }

    async runDistributor() {
        logger.debug("Checking for new emails")
        //const userEmails = (await EmailUser.findAll({attributes: ["email"], where: {[this.distributorType]: 1}, raw: true})).map(user => user.email)
        const userEmails = ["max.dahl1@gmail.com", "max@maxdahl.de", "daagur@daagur.de"]
        const newMessageIds = await this.receiver.getMailIds()
        logger.debug(`Found ${newMessageIds.length}`)
        const sendMessages = []
        for (const id of newMessageIds) {
            try {
                const message = await this.receiver.fetchMessage(id)
                if (!userEmails.includes(message.fromAddress)) {
                    logger.info(`Found message from sender ${message.fromAddress}, who is not in the mailing list`)
                    continue
                }

                for (const email of userEmails) {
                    logger.info(`Sending ${message.subject} to ${email}`)
                    sendMessages.push(this.sender.sendMessage({...message, to: email, from: this.connectionDetails.user}))
                }
            } catch (err) {
                logger.error(err.message)
            }
        }

        await Promise.all(sendMessages)

        for (const id of newMessageIds) {
            await this.receiver.addFlags(id, ["Seen"])
        }
    }
}

export default SupaMail
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
 */
