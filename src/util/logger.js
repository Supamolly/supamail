import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

const {format} = winston
const {combine, timestamp} = format

function filterLogLevel(level) {
    return winston.format(info => {
        const showDebug = process.env.ENVIRONMENT?.toLowerCase() !== "production" || process.argv.includes("debug")
        if (info.level === "debug" && showDebug === false) return false
        return info.level === level ? info : false
    })()
}

function formatLogEntry(level) {
    return combine(
        filterLogLevel(level),
        timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json(),
    )
}

function createLogTransport(level) {
    const logToConsole = process.env.LOG_TO_CONSOLE === "true"
    if (logToConsole) return new winston.transports.Console({level: level, format: formatLogEntry(level)})
    return new DailyRotateFile({
        filename: `${level}_%DATE%`,
        extension: ".log",
        dirname: "logs",
        datePattern: "YYYY-MM-DD",
        maxFiles: 7,
        createSymlink: true,
        symlinkName: `${level}-latest.log`,
        format: formatLogEntry(level),
    })
}

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json(),
    ),
    transports: ["error", "info", "debug"].map(level => createLogTransport(level)),
})

export default logger
