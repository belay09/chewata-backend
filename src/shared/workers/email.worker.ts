import { DoneCallback, Job } from "bull";
import Logger from "bunyan";
import { config } from "@root/config";
import { authService } from "@services/db/auth.service";
import { emailTransport } from "@services/emails/email.transport";
const log: Logger = config.createLogger("authWorker");

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      await emailTransport.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);

      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
