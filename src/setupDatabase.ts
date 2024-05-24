import mongoose from "mongoose";
import { config } from "@root/config";
import Logger from "bunyan";
const log: Logger = config.createLogger("chewata-Database");

export default () => {
    const connect = () => {
        const dbUrl = config.DATABASE_URL;
        if (!dbUrl) {
            log.error("Database URL is not defined");
            return process.exit(1);
        }

        mongoose
            .connect(dbUrl)
            .then(() => {
                return log.info(`Successfully connected to the database`);
            })
            .catch((error) => {
                log.error("Error connecting to database: ", error);
                return process.exit(1);
            });
    }
    connect();
    mongoose.connection.on("disconnected", connect);
};
