import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import EmailAdmin from "../../db/models/EmailAdmin.js"
import logger from "../../util/logger.js"
import verifyToken from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/login", async(req, res) => {
    const failAuth = errorMsg => {
        res.status(403)
        logger.error(errorMsg, {module: "express.api.auth"})
        return res.json({success: false, data: {errors: ["Invalid username/password"]}})
    }

    const {username, password} = req.body
    const user = await EmailAdmin.findOne({where: {name: username}})

    if (!user) return failAuth(`User ${user} not found`)

    const pwdMatch = bcrypt.compare(password, user.password)
    if (!pwdMatch) return failAuth(`Wrong password for user ${user}`)

    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {
        expiresIn: 1000 * 60 * 60 * 24,
    })

    res.json({success: true, data: {token: token}})
})

router.post("/register", async(req, res) => {
    const {username, password} = req.body
    try {
        const existingUser = await EmailAdmin.findOne({where: {name: username}})
        if (existingUser) {
            res.status(409)
            logger.error(`Tried to create duplicate user ${existingUser.name}`, {module: "express.api.auth"})
            return res.json({success: true, data: {errors: ["Username already exist"]}})
        }

        const user = await EmailAdmin.create({
            name: username,
            password: password,
            isOp: false,
        })

        res.json({success: true, data: {userId: user.id, username: user.name}})
    } catch (err) {
        const msg = global.debug === true ? err.stack : "Internal Server Error"
        logger.error(err.stack, {module: "express.api.auth"})
        res.status(500)
        res.json({success: false, data: {errors: [msg]}})
    }
})

router.put("/op", verifyToken, async(req, res) => {
    const {userId, isOp} = req.body

    const user = await EmailAdmin.findOne({where: {id: userId}})
    if (!user) {
        res.status(404)
        logger.error(`User ${req.user.id} tried to op user ${userId}, who does not exist`, {module: "express.api.auth"})
        return res.json({success: false, data: {errors: [`User with id ${userId} not found`]}})
    }

    try {
        await EmailAdmin.update({isOp: isOp === true}, {where: {id: userId}})
        return res.json({success: true})
    } catch (err) {
        logger.error(err.stack, {module: "express.api.auth"})
        const msg = global.debug === true ? err.stack : "Internal Server Error"
        res.status(500)
        res.json({success: false, data: {errors: [msg]}})
    }
})

export default router
