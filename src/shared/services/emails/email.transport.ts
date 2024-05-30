import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import Logger from "bunyan";
import sendGridMail from "@sendgrid/mail";
import { config } from "@root/config";
import { BadRequestError } from "@global/helpers/error-handler";

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}
const log: Logger = config.createLogger("EmailTransport");

sendGridMail.setApiKey(config.SENDGRID_API_KEY!);
class MailTransport {
  public async sendEmail(
    recieverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    if (config.NODE_ENV === "development") {
      await this.developmentEmailSender(recieverEmail, subject, body);
    } else {
      await this.productionEmailSender(recieverEmail, subject, body);
    }
  }

  private async developmentEmailSender(
    recieverEmail: string,
    subject: string,
    body: string
  ) {
    // console.log("inside the devEmail", recieverEmail, subject, body);
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!,
      },
    });
    const mailOptions: IMailOptions = {
      from: `chewata app <${config.SENDER_EMAIL}>`,
      to: recieverEmail,
      subject,
      html: body,
    };
    try {
      // console.log(config.SENDER_EMAIL, config.SENDER_EMAIL_PASSWORD);
      // console.log("mailOptions here we are tring", mailOptions);
      await transporter.sendMail(mailOptions);
      log.info("developmentEmail sent successfully");
    } catch (error) {
      log.error({ error }, "Error sending email");
      throw new BadRequestError("Error sending email");
    }
  }
  private async productionEmailSender(
    recieverEmail: string,
    subject: string,
    body: string
  ) {
    const mailOptions: IMailOptions = {
      from: `chewata app <${config.SENDGRID_SENDER}>`,
      to: recieverEmail,
      subject,
      html: body,
    };
    try {
      await sendGridMail.send(mailOptions);
      log.info("production Email sent successfully");
    } catch (error) {
      log.error({ error }, "Error sending email");
      throw new BadRequestError("Error sending email");
    }
  }
}

export const emailTransport = new MailTransport();
