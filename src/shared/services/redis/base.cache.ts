import { createClient } from "redis";
import Logger from 'bunyan'
import { config } from "@root/config";
export type RedisClient = ReturnType<typeof createClient>;
export abstract class BaseCache {
    client: RedisClient;
    logger: Logger;
    constructor(cacheName: string) {
        this.client = createClient({url :config.REDIS_URL});
        this.logger =config.createLogger(cacheName);
        this.cacheError();
    }
    private cacheError(): void {
        this.client.on("error", (error:unknown) => {
            this.logger.error(error);
        });
    }
}