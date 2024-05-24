import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import cookieSeeion from "cookie-session";
import HTTP_STATUS from "http-status-codes";
import "express-async-errors";
import { config } from "@root/config";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { server } from "typescript";
import ApplicationRoutes from "@root/routes";
import Logger from "bunyan";
import { CustomError, IErrorResponse } from "@global/helpers/error-handler";
const SERVER_PORT = 5000;
const log: Logger = config.createLogger("chewata-server");
export class chewataServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application): void {
    const secretKey1 = config.SECRETE_KEY_1;
    const secretKey2 = config.SECRETE_KEY_2;
    if (!secretKey1 || !secretKey2) {
      throw new Error("Secret keys are not defined");
    }
    app.use(
      cookieSeeion({
        name: "session",
        keys: [secretKey1, secretKey2],
        maxAge: 24 * 7 * 60 * 60 * 1000,
        secure: config.NODE_ENV !== "development", //true for https
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: "*",
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE"],
      })
    );
  }
  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(
      json({
        limit: "50mb",
      })
    );
    app.use(urlencoded({ extended: true, limit: "50mb" }));
  }
  private routeMiddleware(app: Application): void {
    ApplicationRoutes(app);
   
  }
  private globalErrorHandler(app: Application): void {
    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: HTTP_STATUS.NOT_FOUND,
        message: "Route not found",
      });
    }
    );
    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if(error instanceof CustomError){
        return res.status(error.status).json(error.serializeError());
      }
      
    });

  }
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIo: Server = await this.createSocketIo(httpServer);
        this.socketIoConnection(socketIo);
      this.startHttpServer(httpServer);
    } catch (error) {
      log.error("Error while starting server", error);
    }
  }
  private async createSocketIo(httpServer: http.Server): Promise<Server> {
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    const pubClient = createClient({ url: config.REDIS_URL });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }
  private startHttpServer(httpServer: http.Server): void {
    log.info ("server has started with process id", process.pid);
    httpServer.listen(SERVER_PORT, () => {
    log.info(`Server is running on port ${SERVER_PORT}`);
    });
  }
  private socketIoConnection(io: Server): void {}
}
