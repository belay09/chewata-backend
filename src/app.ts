import express,{ Express } from "express";
import {chewataServer} from "./setupServer";
import databaseConnection from "./setupDatabase"
class Application {
    public intialize(): void {
        databaseConnection();
        const app: Express = express();
        const server = new chewataServer(app);
        
        server.start();


    }

}
const application = new Application();
application.intialize();