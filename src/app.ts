import express,{ Express } from "express";
import {chewataServer} from "@root/setupServer";
import databaseConnection from "@root/setupDatabase"
import {config} from "@root/config";
class Application {
    public intialize(): void {
        this.loadConfig();

        databaseConnection();
        const app: Express = express();
        const server = new chewataServer(app);
        
        server.start();


    }
    private loadConfig(): void {
        config.validateConfig();
        config.cloudinaryConfig();
    }

}
const application = new Application();
application.intialize();