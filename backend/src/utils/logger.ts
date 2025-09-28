import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty", // development colorful logs
    options: { colorize: true }
  }
});

export default logger;
