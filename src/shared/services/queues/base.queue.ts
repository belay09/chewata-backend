import Queue, { Job } from "bull";
import Logger from "bunyan";
import { IEmailJob } from "@user/interface/user.interface";

import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { config } from "@root/config";
import { IAuthJob } from "@auth/interfaces/auth.interface";
type IBaseJobData = IAuthJob | IEmailJob;
let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;
export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;
  constructor(queueName: string) {
    // console.log("QueueName", queueName);
    this.queue = new Queue(queueName, `${config.REDIS_URL}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/queues");
    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });
    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on("completed", (job: Job) => {
      // job.remove();
    });

    this.queue.on("global:completed", (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on("global:stalled", (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });
  }
  protected addJob(name: string, data: IBaseJobData): void {
    // console.log("addJob", name, data);
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: "fixed", delay: 5000 },
    });
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): void {
    this.queue.process(name, concurrency, callback);
  }
}
