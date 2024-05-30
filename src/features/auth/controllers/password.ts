import { Request, Response } from "express";
import { authService } from "@services/db/auth.service";
import { BadRequestError } from "@global/helpers/error-handler";
import HTTP_STATUS from "http-status-codes";
import { joiValidation } from "@global/decorators/joi-validation-decorator";
import JWT from "jsonwebtoken";
import { config } from "@root/config";
import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { emailSchema, passwordSchema } from "@auth/schemes/password";
import crypto from "crypto";
import Logger from "bunyan";
import { forgotPasswordTemplate } from "@services/emails/template/forgot-password/forgot-password-template";
import { emailQueue } from "@services/queues/email.queue";
import { IResetPasswordParams } from "@user/interface/user.interface";
import { resetPasswordTemplate } from "@services/emails/template/reset-password/reset-password-template";
import moment from "moment";
import publicIP from "ip";
const log: Logger = config.createLogger("PasswordController");
export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    // Implementation
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByEmail(email);
    log.info("User found", existingUser);
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString("hex");
    await authService.updatePasswordToken(
      `${existingUser._id}`,
      randomCharacters,
      Date.now() + 3600000
    );
    const resetLink: string = `http://localhost:3000/reset-password/${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser?.username,
      resetLink
    );
    emailQueue.addEmailJob("forgot", {
      template,
      receiverEmail: email,
      subject: `Reset Password email sent ${existingUser?.username}`,
    });
    res.status(HTTP_STATUS.OK).json({ message: "Reset password email sent" });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    // Implementation
    log.info("Password reset IMPLEMENTATION STARTED");
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    const existingUser: IAuthDocument = await authService.getUserByResetToken(
      token
    );

    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    if (password !== confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }
    existingUser.password = password;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    const template: string =
      resetPasswordTemplate.passwordResetConformationTemplate(templateParams);

    emailQueue.addEmailJob("forgot", {
      template,
      receiverEmail: existingUser.email,
      subject: "password reset conformation email",
    });
    res.status(HTTP_STATUS.OK).json({ message: "reset conformation " });
  }
}
