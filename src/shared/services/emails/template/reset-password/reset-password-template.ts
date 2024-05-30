import fs from "fs";
import ejs from "ejs";
import { IResetPasswordParams } from "@user/interface/user.interface";

class ResetPasswordTemplate {
  public passwordResetConformationTemplate(
    templateParams: IResetPasswordParams
  ) {
    const template = fs.readFileSync(
      "src/shared/services/emails/template/reset-password/reset-password-template.ejs",
      "utf8"
    );
    const { username, email, ipaddress, date } = templateParams;

    return ejs.render(template, {
      username,
      email,
      ipaddress,
      date,
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgV8-c-j1LC4EPAg9gLJd2HC51AOOAlMcaU6iby-4NAQ&s",
    });
  }
}
export const resetPasswordTemplate = new ResetPasswordTemplate();
