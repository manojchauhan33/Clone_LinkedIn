import app from "./app";
import dotenv from "dotenv";
import sequelize from "./config/db";
import logger from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected");

    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err: any) {
    logger.error(err, "DB connection failed");
  }
};

startServer();
