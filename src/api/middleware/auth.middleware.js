import jwt from "jsonwebtoken"
import EmailAdmin from "../../db/models/EmailAdmin.js"
import logger from "../../util/logger.js"

async function verifyToken(req, res, next) {
    const failVerification = async debugMsg => {
        const errors = ["Verification failed"]
        if (global.debug === true) errors.push(debugMsg)

        logger.error(debugMsg, {module: "express.api.middleware.auth"})
        return res.status(403).json({success: false, data: {errors: errors}})
    }

    const token = req.get("Bearer")

    if (token) {
        try {
            const decodedToken = await jwt.verify(token, process.env.JWT_SECRET)

            const userId = decodedToken.id
            const user = await EmailAdmin.findOne({
                where: {id: userId},
                attributes: {exclude: ["password"]},
            })

            if (!user) return failVerification(`User with userId ${userId} not found`)
            else if (!user.isOp) return failVerification(`User with userId ${userId} has no OP privileges`)
            else {
                // eslint-disable-next-line require-atomic-updates
                req.user = user
                return next()
            }
        } catch (err) {
            return failVerification(err.stack)
        }
    }
}

export default verifyToken
