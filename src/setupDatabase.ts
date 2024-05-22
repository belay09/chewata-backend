import mongoose from "mongoose";

export default () => {
    const connect = () => {
        mongoose
            .connect("mongodb://localhost:27017/chewata")
            .then(() => {
                return console.info(`Successfully connected to the database`);
            })
            .catch((error) => {
                console.error("Error connecting to database: ", error);
                return process.exit(1);
            });
    }
    connect();
    mongoose.connection.on("disconnected", connect);
};
