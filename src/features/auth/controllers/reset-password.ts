import { Request, Response } from "express";
import { authService } from "@services/db/auth.service";
import { BadRequestError } from "@global/helpers/error-handler";
import HTTP_STATUS from "http-status-codes";
import { joiValidation } from "@global/decorators/joi-validation-decorator";

import { IAuthDocument } from "@auth/interfaces/auth.interface";
import { emailSchema } from "@auth/schemes/password";
import { passwordSchema } from "@auth/schemes/password";
import crypto from "crypto";
import { forgotPasswordTemplate } from "@services/emails/template/forgot-password/forgot-password-template";
import { emailQueue } from "@services/queues/email.queue";
export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    // Implementation
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByEmail(email);

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
    const resetLink: string = `https/reset-password/${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink
    );
    emailQueue.addEmailJob("forgot", {
      template,
      receiverEmail: email,
      subject: "Reset Password email sent",
    });
    res.status(HTTP_STATUS.OK).json({ message: "Reset password email sent" });
  }
  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    // Implementation
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByEmail(email);

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
    const resetLink: string = `https/reset-password/${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username,
      resetLink
    );
    emailQueue.addEmailJob("forgot", {
      template,
      receiverEmail: email,
      subject: "Reset Password email sent",
    });
    res.status(HTTP_STATUS.OK).json({ message: "Reset password email sent" });
  }
}
