import nodemailer from "nodemailer";
import { APP_EMAIL, APP_PASSWORD, APPLICATIION_NAME } from "./../../../config.js";
import { BadRequestException } from "../../exceptions/errors.exceptions.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const UserKey = ({ email, subject = EmailSubjectEnum.CONFIRM_EMAIL }) => {
  return `User::${email}::${subject}`;
};
export const UserEmailKey = ({ email, subject = EmailSubjectEnum.CONFIRM_EMAIL }) => {
  return `${UserKey({ email, subject })}::OTP`;
};

export const UserEmailTrailsKey = ({ email, subject = EmailSubjectEnum.CONFIRM_EMAIL }) => {
  return `${UserEmailKey({ email, subject })}::Trails`;
};

export const UserLoginTrailsKey = ({ email, subject = EmailSubjectEnum.CONFIRM_EMAIL }) => {
  return `${UserKey({email , subject})}::Login::Trails`;
};

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendEmail = async ({ to, cc, bcc, subject, text, html, attachments = [] }) => {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw BadRequestException({ message: "Missing email recipients" });
    }
    if (!text?.length && !html?.length && !attachments?.length) {
      throw BadRequestException({ message: "Missing email content" });
    }
    const info = await transporter.sendMail({
      from: `"${APPLICATIION_NAME}" <${APP_EMAIL}>`, // sender address
      to, // list of recipients
      cc,
      bcc,
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};
