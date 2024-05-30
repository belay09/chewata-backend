import fs from "fs";
import ejs from "ejs";

class ForgotPasswordTemplate {
  public passwordResetTemplate(username: string, resetLink: string) {
    const template = fs.readFileSync(
      "src/shared/services/emails/template/forgot-password/forgot-password-template.ejs",
      "utf8"
    );
    return ejs.render(template, {
      username,
      resetLink,
      image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgV8-c-j1LC4EPAg9gLJd2HC51AOOAlMcaU6iby-4NAQ&s",
    });
  }
}
export const forgotPasswordTemplate = new ForgotPasswordTemplate();
