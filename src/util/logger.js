import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const logger = winston.createLogger({
    level: process.argv.includes("debug") ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json(),
    ),
    transports: [
        new DailyRotateFile({filename: "logs/errors_%DATE%.log", level: "error"}),
        new DailyRotateFile({filename: "logs/global_%DATE%.log"}),
        new winston.transports.Console(),
    ],
})

export default logger
