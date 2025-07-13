import capitalize from "lodash-es/capitalize";
import moment from "moment";
import "moment-timezone";
import { config, createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors } = format;

const tsFormat = () =>
    moment().tz("America/Los_Angeles").format("YYYY-MM-DD hh:mm:ss A").trim();

const customFormat = printf(({ level, message, timestamp, stack }) =>
    stack
        ? `[${timestamp}] ${capitalize(level)}: ${message}\n${(stack as string).toString()}`
        : `[${timestamp}] ${capitalize(level)}: ${message}`,
);

const rotateOpts = {
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
};

/**
 *
 * @param path Path for where logs will be stored
 * @returns
 */
const initLogger = (
    path?: string,
    environment: "development" | "production" = (process.env.NODE_ENV =
        "production"),
) =>
    createLogger({
        levels: config.syslog.levels,
        level: environment === "production" ? "info" : "debug",
        format: combine(
            errors({ stack: true }),
            timestamp({
                format: tsFormat,
            }),
            customFormat,
        ),

        rejectionHandlers: [
            ...(path
                ? [
                      new transports.DailyRotateFile({
                          filename: `${path}/rejections-%DATE%.log`,
                          ...rotateOpts,
                      }),
                  ]
                : []),
            ...(environment === "development"
                ? [
                      new transports.Console({
                          format: combine(
                              format.colorize({ all: true }),
                              customFormat,
                          ),
                      }),
                  ]
                : []),
        ],
        exceptionHandlers: [
            ...(path
                ? [
                      new transports.DailyRotateFile({
                          filename: `${path}/exceptions-%DATE%.log`,
                          ...rotateOpts,
                      }),
                  ]
                : []),
            ...(environment === "development"
                ? [
                      new transports.Console({
                          format: combine(
                              format.colorize({ all: true }),
                              customFormat,
                          ),
                      }),
                  ]
                : []),
        ],
        transports: [
            new transports.DailyRotateFile({
                filename: `${path}/errors-%DATE%.log`,
                level: "error",
                ...rotateOpts,
            }),
            new transports.DailyRotateFile({
                filename: `${path}/all-%DATE%.log`,
                ...rotateOpts,
            }),
            ...(environment === "development"
                ? [
                      new transports.Console({
                          format: combine(
                              format.colorize({ all: true }),
                              customFormat,
                          ),
                      }),
                  ]
                : []),
        ],
    });

export default initLogger;
