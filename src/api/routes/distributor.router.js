const express = require("express")
const verifyToken = require("../middleware/auth.middleware.js")
const EmailUser = require("../../db/models/EmailUser.js")
const logger = require("../../util/logger.js")
const router = express.Router()

function onError(res, msg, debugMsg) {
    const errors = [msg]
    if (global.debug === true) errors.push(debugMsg)
    logger.error(debugMsg, {module: "express.api.distributor"})

    res.status(500)
    res.json({success: false, data: {errors: errors}})
}

router.post("/", verifyToken, async(req, res) => {
    try {
        const {name, email, distributors} = req.body
        const existingUser = await EmailUser.findOne({where: {email: email}})
        if (existingUser) {
            res.status(409)
            logger.error(`Tried to add ${existingUser.email} to distributor, but it already exists`, {module: "express.api.distributor"})
            return res.json({success: true, data: {errors: ["Email already added to distributor"]}})
        }

        const user = await EmailUser.create({
            name: name,
            email: email,
            ton: distributors.ton === true,
            licht: distributors.licht === true,
            tech: distributors.tech === true,
            supa: distributors.supa === true,
            hoerliste: distributors.hoerliste === true,
            it: distributors.it === true,
        })

        logger.info(`${req.user.name} added ${email} to ${JSON.stringify(distributors)}`)
        res.json({success: true, data: user.toJSON()})
    } catch (err) {
        onError(res, "Internal Server Error", err.stack)
    }
})

router.put("/", verifyToken, async(req, res) => {
    try {
        const {email, distributors} = req.body
        const user = EmailUser.findOne({where: {email: email}})
        if (!user) return res.status(404).json({success: false, data: {errors: [`Email ${email} not in distributor list`]}})

        await EmailUser.update({
            ton: distributors.ton ?? user.ton,
            licht: distributors.licht ?? user.licht,
            tech: distributors.tech ?? user.tech,
            supa: distributors.supa ?? user.supa,
            hoerliste: distributors.hoerliste ?? user.hoerliste,
            it: distributors.it ?? user.it,
        }, {where: {email: email}})

        logger.info(`${req.user.name} updated ${email} to be subscribed to ${JSON.stringify(distributors)}`)
        res.json({success: true})
    } catch (err) {
        onError(res, "Internal Server Error", err.stack)
    }
})

router.delete("/", verifyToken, async(req, res) => {
    try {
        const {email} = req.body
        const user = await EmailUser.findOne({where: {email: email}})
        if (!user) return res.status(404).json({success: false, data: {errors: [`Email ${email} not in distributor list`]}})

        await EmailUser.destroy({where: {email: email}})
        logger.info(`${req.user.name} deleted ${email}`, {module: "express.api.distributor"})
        res.json({success: true})
    } catch (err) {
        onError(res, "Internal Server Error", err.stack)
    }
})
module.exports = router
