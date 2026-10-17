import { z } from "zod";
import { GenderEnum, LanguageEnum, LogoutEnum } from "./enum/index.js";
import mongoose from "mongoose";

const matchFields = ({ original, copy, data, ctx, lang }) => {
  if (data[original] != data[copy]) {
    ctx.addIssue({
      code: "custom",
      path: [copy],
      message: `${
        lang == LanguageEnum.AR
          ? `لا يوجد تطابق بين ${original} و ${copy}`
          : `Failed to match between ${original} and ${copy}`
      }`,
    });
  }
};

export const generalValidationFields = {
  email: (lang) =>
    z.email({
      message:
        lang == LanguageEnum.AR
          ? "الايميل الذى قمت بإدخالة غير صحيح من فضلة ضم بإدخال إيميل صحيح"
          : "Invalid email format please add valid email like example@any.com",
    }),
  password: (lang) =>
    z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
      message:
        lang == LanguageEnum.AR
          ? "يجب ألا تقل كلمة المرور عن 8 خانات، وتتضمن حرفاً كبيراً، وحرفاً صغيراً، ورقماً واحداً على الأقل"
          : "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number",
    }),
  userName: (lang) =>
    z.string().min(2, {
      message: lang == LanguageEnum.AR ? "عفوا لا يمكن ادخال اسم المستخدم اقل من حرفين" : "min length is 2 chars",
    }),
  confirmPassword: (lang) =>
    z
      .string()
      .min(6, { message: lang == LanguageEnum.AR ? "اقل طول للباسورد 6 احرف" : "invalid password length < 6 chars" })
      .max(16, {
        message: lang == LanguageEnum.AR ? "اكبر طول للباسورد 16 حرف" : "invalid password length > 16 chars",
      }),
  phone: (lang) =>
    z
      .string()
      .regex(
        /^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/,
        lang == LanguageEnum.AR ? "يجب إدخال رقم مصرى فقط" : "Invalid egyption phone number",
      ),
  otp: (lang) =>
    z
      .string()
      .regex(/^\d{6}$/, lang == LanguageEnum.AR ? "يجب أدخال عدد 6 أرقام فقط" : "OTP should contain 6 numbers only"),
  gender: (lang) =>
    z.enum(GenderEnum, {
      message: lang == LanguageEnum.AR ? "المسموح بدخالة 0 للذكر و 1 للانثى" : "only valid 0 for male and 1 for female",
    }),
  privileges: (lang) =>
    z.array(z.string(), { message: lang == LanguageEnum.AR ? "معرف الصلاحية خطا" : "invalid id privilage" }),
  action: (lang) =>
    z.enum(LogoutEnum, {
      message:
        lang == LanguageEnum.AR
          ? "يجب تحديد نوع تسجيل الخروج اما 0 لجهاز واحد او 1 كل الاجهزة"
          : "you should select type of logout between 0 for one device or 1 for all devices",
    }),

  matchFields,
  id: (lang) =>
    z.string().refine(
      (data) => {
        return mongoose.Types.ObjectId.isValid(data);
      },
      { message: lang == LanguageEnum.AR ? "صيغة خطا" : "Invalid format" },
    ),
  file: (lang) =>
    z.strictObject({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      buffer: z.instanceof(Buffer),
      size: z.number(),
      path: z.string(),
    }),
};
