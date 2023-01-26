import winston from "winston";

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;
const { Console } = transports;

const logger = createLogger({
  level: "debug",
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp, ...additionalInfo }) => {
      return `[${new Date(
        timestamp
      ).toLocaleTimeString()}] [${level}] ${message} ${
        Object.keys(additionalInfo).length ? JSON.stringify(additionalInfo) : ""
      }`;
    })
  ),
  transports: [new Console()],
});

export default logger;
