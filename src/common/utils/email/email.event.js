import { EventEmitter } from "node:events";
import { sendEmail } from "./email.service.js";
import { verifyEmailTemplate } from "./email.templates.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ recipients, subject = EmailSubjectEnum.CONFIRM_EMAIL, data }) => {
  try {
    await sendEmail({
      ...recipients,
      subject,
      html: verifyEmailTemplate({ subject, data }),
    });
  } catch (error) {
    console.log(error);
  }
});
