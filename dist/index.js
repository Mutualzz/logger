Object.defineProperty(exports, '__esModule', { value: true });

var capitalize = require('lodash-es/capitalize');
var moment = require('moment');
require('moment-timezone');
var winston = require('winston');
require('winston-daily-rotate-file');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var capitalize__default = /*#__PURE__*/_interopDefault(capitalize);
var moment__default = /*#__PURE__*/_interopDefault(moment);

const { combine, timestamp, printf, errors } = winston.format;
const tsFormat = ()=>moment__default.default().tz("America/Los_Angeles").format("YYYY-MM-DD hh:mm:ss A").trim();
const customFormat = printf(({ level, message, timestamp, stack })=>stack ? `[${timestamp}] ${capitalize__default.default(level)}: ${message}\n${stack.toString()}` : `[${timestamp}] ${capitalize__default.default(level)}: ${message}`);
const rotateOpts = {
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
};
/**
 *
 * @param path Path for where logs will be stored
 * @returns
 */ const initLogger = (path, environment = process.env.NODE_ENV = "production")=>winston.createLogger({
        levels: winston.config.syslog.levels,
        level: environment === "production" ? "info" : "debug",
        format: combine(errors({
            stack: true
        }), timestamp({
            format: tsFormat
        }), customFormat),
        rejectionHandlers: [
            ...path ? [
                new winston.transports.DailyRotateFile({
                    filename: `${path}/rejections-%DATE%.log`,
                    ...rotateOpts
                })
            ] : [],
            ...environment === "development" ? [
                new winston.transports.Console({
                    format: combine(winston.format.colorize({
                        all: true
                    }), customFormat)
                })
            ] : []
        ],
        exceptionHandlers: [
            ...path ? [
                new winston.transports.DailyRotateFile({
                    filename: `${path}/exceptions-%DATE%.log`,
                    ...rotateOpts
                })
            ] : [],
            ...environment === "development" ? [
                new winston.transports.Console({
                    format: combine(winston.format.colorize({
                        all: true
                    }), customFormat)
                })
            ] : []
        ],
        transports: [
            new winston.transports.DailyRotateFile({
                filename: `${path}/errors-%DATE%.log`,
                level: "error",
                ...rotateOpts
            }),
            new winston.transports.DailyRotateFile({
                filename: `${path}/all-%DATE%.log`,
                ...rotateOpts
            }),
            ...environment === "development" ? [
                new winston.transports.Console({
                    format: combine(winston.format.colorize({
                        all: true
                    }), customFormat)
                })
            ] : []
        ]
    });

exports.default = initLogger;
