import { z } from "zod";
import { GenderEnum } from "../../common/enum/index.js";
import { generalValidationFields } from "../../common/validatoin.js";

export const loginSchema = (lang) => {
  return z.strictObject({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  });
};

export const login = (lang) => {
  return z.object({
    body: loginSchema(lang),
    query: z.strictObject({
      lang: z.enum(["ar", "en"]).default("ar"),
    }),
  });
};

export const signup = (lang) => {
  return z.object({
    body: loginSchema(lang)
      .safeExtend({
        userName: generalValidationFields.userName(lang),
        confirmPassword: generalValidationFields.confirmPassword(lang),
        phone: generalValidationFields.phone(lang),
        gender: generalValidationFields.gender(lang),
        privileges: generalValidationFields.privileges(lang).optional(),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang });
        if (!data.userName.includes(" ")) {
          ctx.addIssue({
            code: "custom",
            path: ["userName"],
            message: "userName must includes space between firstName and lastName",
          });
        }
      }),
  });
};

export const logoutSchema = (lang) => {
  return z.object({
    body: z.strictObject({
      action: generalValidationFields.action(lang),
    }),
  });
};

//   .refine(
//     (data) => {
//       return data.password == data.confirmPassword;
//     },
//     { message: "password mismatch confirmPassword", path: ["confirmPassword"] },
//   );

export const confirmEmail = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
      otp: generalValidationFields.otp(lang),
    }),
  });
};

export const resendOtp = (lang) => {
  return z.object({
    body: z.strictObject({
      email: generalValidationFields.email(lang),
    }),
  });
};

export const resetPassword = (lang) => {
  return z.object({
    body: z
      .strictObject({
        email: generalValidationFields.email(lang),
        otp: generalValidationFields.otp(lang),
        password: generalValidationFields.password(lang),
        confirmPassword: generalValidationFields.confirmPassword(lang),
      })
      .superRefine((data, ctx) => {
        generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang });
      }),
  });
};
