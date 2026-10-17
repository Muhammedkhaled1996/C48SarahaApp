import { APPLICATIION_NAME } from "../../../config.js";
import { EmailSubjectEnum } from "../../enum/email.enum.js";

export const templates = {
  [EmailSubjectEnum.CONFIRM_EMAIL]: ({ data, subject }) => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f3f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f3f5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- الحاوية الرئيسية ذات الزوايا الدائرية -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06); padding: 40px 30px;">
          
          <!-- رابط أيقونة الـ CDN -->
          <tr>
            <td align="center" style="padding-bottom: 25px;">
              <img src="https://cdn-icons-png.flaticon.com/512/9437/9437533.png" alt="Icon" width="48" height="48" style="display: block; border: 0; outline: none; text-decoration: none;">
            </td>
          </tr>

          <!-- العنوان الرئيسي -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; color: #486581; letter-spacing: -0.5px;">${subject}</h1>
            </td>
          </tr>

          <!-- نص التحية والتعليمات -->
          <tr>
            <td align="center" style="padding-bottom: 30px; color: #4a5568; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 8px; font-size: 16px;">مرحباً ${data.userName}،</p>
              <p style="margin: 0;">قم بتأكيد بريدك الإلكتروني بالضغط على الزر أدناه لتسجيل الدخول على هذا الجهاز.</p>
            </td>
          </tr>

          <!-- زر التأكيد -->
          <tr>
            <td align="center" style="padding-bottom: 35px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #b84a44;">
                    <a href="{{CONFIRMATION_URL}}" target="_blank" style="display: inline-block; padding: 14px 44px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">${subject}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- نص إدخال الكود يدوياً -->
          <tr>
            <td align="center" style="padding-bottom: 20px; color: #4a5568; font-size: 14px;">
              أو يمكنك نسخ ولصق هذه الأرقام داخل التطبيق:
            </td>
          </tr>

          <!-- كود الـ OTP -->
          <tr>
            <td align="center" style="padding-bottom: 35px;">
              <span style="font-size: 26px; font-weight: 700; letter-spacing: 12px; color: #2d3748; font-family: Consolas, Monaco, monospace; display: inline-block; padding-right: 12px;">${data.code}</span>
            </td>
          </tr>

          <!-- تنبيه التجاهل -->
          <tr>
            <td align="center" style="color: #718096; font-size: 13px; line-height: 1.5; border-top: 1px solid #edf2f7; padding-top: 25px;">
              إذا لم تطلب تأكيد هويتك، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  },
  [EmailSubjectEnum.FORGET_PASSWORD]: ({ data, subject }) => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f2f3f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f3f5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- الحاوية الرئيسية ذات الزوايا الدائرية -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06); padding: 40px 30px;">
          
          <!-- رابط أيقونة الـ CDN -->
          <tr>
            <td align="center" style="padding-bottom: 25px;">
              <img src="https://cdn-icons-png.flaticon.com/512/9437/9437533.png" alt="Icon" width="48" height="48" style="display: block; border: 0; outline: none; text-decoration: none;">
            </td>
          </tr>

          <!-- العنوان الرئيسي -->
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 500; color: #486581; letter-spacing: -0.5px;">${subject}</h1>
            </td>
          </tr>

          <!-- نص التحية والتعليمات -->
          <tr>
            <td align="center" style="padding-bottom: 30px; color: #4a5568; font-size: 15px; line-height: 1.6;">
              <p style="margin: 0 0 8px; font-size: 16px;">مرحباً ${data.userName}،</p>
              <p style="margin: 0;">قم بتأكيد بريدك الإلكتروني بالضغط على الزر أدناه لتسجيل الدخول على هذا الجهاز.</p>
            </td>
          </tr>

          <!-- زر التأكيد -->
          <tr>
            <td align="center" style="padding-bottom: 35px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #b84a44;">
                    <a href="{{CONFIRMATION_URL}}" target="_blank" style="display: inline-block; padding: 14px 44px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">${subject}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- نص إدخال الكود يدوياً -->
          <tr>
            <td align="center" style="padding-bottom: 20px; color: #4a5568; font-size: 14px;">
              أو يمكنك نسخ ولصق هذه الأرقام داخل التطبيق:
            </td>
          </tr>

          <!-- كود الـ OTP -->
          <tr>
            <td align="center" style="padding-bottom: 35px;">
              <span style="font-size: 26px; font-weight: 700; letter-spacing: 12px; color: #2d3748; font-family: Consolas, Monaco, monospace; display: inline-block; padding-right: 12px;">${data.code}</span>
            </td>
          </tr>

          <!-- تنبيه التجاهل -->
          <tr>
            <td align="center" style="color: #718096; font-size: 13px; line-height: 1.5; border-top: 1px solid #edf2f7; padding-top: 25px;">
              إذا لم تطلب تأكيد هويتك، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
              </html>`;
  },
};

export const verifyEmailTemplate = ({ data, subject }) => {
  return templates[subject]({ data, subject });
};
