import { IEmailJob } from "@user/interface/user.interface";
import { BaseQueue } from "./base.queue";
import { emailWorker } from "@workers/email.worker";

class EmailQueue extends BaseQueue {
  constructor() {
    super("email");
    this.processJob("forgot", 5, emailWorker.addNotificationEmail);
  }
  public async addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}

export const emailQueue = new EmailQueue();
