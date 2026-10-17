import { providerEnum } from "../../common/enum/provider.enum.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  TooManyRequestsException,
} from "../../common/exceptions/errors.exceptions.js";
import { create, createOne, findOne } from "../../common/repository/db.repository.js";
import {
  createLoginCredentials,
  createRevokeToken,
  userBaseRevokeTokenKey,
  userRevokeTokenKey,
} from "../../common/security/index.js";
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, WEB_CLIENT_IDS } from "../../config.js";
import { UserModel, UserPrivilege } from "../../DB/module/user.model.js";
import { OAuth2Client } from "google-auth-library";
import { compared, hashed, encryption } from "./../../common/security/index.js";
import { del, keys, set, get, ttl, incrementBy, expire } from "../../common/services/index.js";
import { EmailSubjectEnum, LogoutEnum } from "../../common/enum/index.js";
import {
  createOTP,
  sendEmail,
  UserEmailKey,
  UserEmailTrailsKey,
  UserLoginTrailsKey,
} from "../../common/utils/index.js";
import { emailEvent } from "../../common/utils/email/email.event.js";

const client = new OAuth2Client();

// send email otp function
const sendEmailOtp = async ({ account, subject, expiresIn = 120, maxTrails = 3, blockInSeconds = 300 }) => {
  const email = account?.email;
  const existOtpTtl = await ttl({ key: UserEmailKey({ email, subject }) });

  if (existOtpTtl > 0) {
    throw BadRequestException({
      message: `Sorry we cannot create new otp while existing one still try again later after ${existOtpTtl}s`,
    });
  }

  const oldTrails = (await get({ key: UserEmailTrailsKey({ email, subject }) })) ?? 0;

  if (oldTrails >= maxTrails) {
    throw TooManyRequertException({ message: "Max otp trails has been reached" });
  }

  const code = createOTP();

  await set({
    key: UserEmailKey({ email, subject }),
    value: await hashed({ plainText: code.toString() }),
    ttl: expiresIn,
  });

  const currentTrails = await incrementBy({ key: UserEmailTrailsKey({ email, subject }), count: 1 });

  if (currentTrails == 3) {
    await expire({ key: UserEmailTrailsKey({ email, subject }), ttl: blockInSeconds });
  }

  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    subject,
    data: { code, userName: account.userName },
  });
};

// login attempt functions
// export const checkLoginBlocked = async ({ email, subject = "LOGIN", maxTrails = 3 }) => {
//   const key = UserLoginTrailsKey({ email, subject });
//   const attempts = await get({ key });
//   const ttlLeft = await ttl({ key });

//   if (attempts && Number(attempts) >= maxTrails && ttlLeft > 0) {
//     throw TooManyRequestsException({
//       message: `Too many failed attempts. Try again in ${ttlLeft} seconds.`,
//     });
//   }
// };

// export const recordFailedAttempt = async ({
//   email,
//   subject = "LOGIN",
//   maxTrails = 3,
//   blockInSeconds = 300,
//   windowInSeconds = 60,
// }) => {
//   const key = UserLoginTrailsKey({ email, subject });

//   const currentAttempts = await incrementBy({ key, count: 1 });

//   if (currentAttempts === 1) {
//     await expire({ key, ttl: windowInSeconds });
//   }

//   if (currentAttempts >= maxTrails) {
//     await expire({ key, ttl: blockInSeconds });
//     throw TooManyRequestsException({
//       message: `Account temporarily locked due to too many failed attempts. Try again in ${blockInSeconds}s.`,
//     });
//   }
// };

// verify Google account function
async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_IDS,
  });
  const payload = ticket.getPayload();
  return payload;
}

// signup function
export const signup = async (inputs, issuer) => {
  const { email, password, confirmPassword, userName, gender, phone, privileges = [] } = inputs.body;

  const userExists = await findOne({
    model: UserModel,
    filter: { email },
    populate: [{ path: "privileges", select: "code" }],
  });
  if (userExists) {
    throw ConflictException({
      message: "User already exists",
    });
  }

  const account = await create({
    model: UserModel,
    data: {
      email,
      password: await hashed({ plainText: password }),
      confirmPassword: await hashed({ plainText: confirmPassword }),
      userName,
      phone: await encryption(phone),
      privileges,
    },
  });

  // const { access_token, refresh_token } = await createLoginCredentials(account[0], issuer);

  // Send confirm email with otp
  await sendEmailOtp({ account: account[0], subject: EmailSubjectEnum.CONFIRM_EMAIL });

  // return { access_token, refresh_token };
  return { message: "Account created successfully. Please check your email for confirmation." };
};

// resend email otp function
export const resendEmail = async (inputs) => {
  const { email } = inputs.body;
  const account = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: false } },
  });

  if (!account) {
    throw NotFoundException({ message: "Invalid email" });
  }

  // Send confirm email with otp
  await sendEmailOtp({ account, subject: EmailSubjectEnum.CONFIRM_EMAIL });

  return;
};

// confirm email function
export const confirmEmail = async (inputs) => {
  const { email, otp } = inputs.body;
  const account = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: false } },
  });

  if (!account) {
    throw NotFoundException({ message: "Invalid email" });
  }

  const userKey = UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });

  const hashOtp = await get({ key: userKey });
  if (!hashOtp || !(await compared({ ciperText: hashOtp, plainText: otp.toString() }))) {
    throw ConflictException({ message: "Invalid otp" });
  }
  account.confirmEmail = new Date();
  await account.save();
  await del({ key: await keys({ prefix: userKey }) });
  return;
};

// login function
export const login = async (inputs, issuer) => {
  const { email, password } = inputs.body;

  // await checkLoginBlocked({ email, subject: "LOGIN", maxTrails: 3 });

  const user = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: true } },
    populate: [{ path: "privileges", select: "code" }],
  });

  if (!user) {
    // await recordFailedAttempt({ email, subject: "LOGIN", maxTrails: 3, blockInSeconds: 300, windowInSeconds: 60 });
    throw  NotFoundException({
      message: "Invalid credentials",
    });
  }

  const cipherPassword = user.password;

  const match = await compared({
    ciperText: cipherPassword,
    plainText: password,
  });

  if (!match) {
    // await recordFailedAttempt({ email, subject: "LOGIN" });
    throw NotFoundException({
      message: "Invalid credentials",
    });
  }

  await del({ key: UserLoginTrailsKey({ email, subject: "LOGIN" }) });

  const { access_token, refresh_token } = await createLoginCredentials(user, issuer);
  return { access_token, refresh_token };
};

// privilege creation function
export const privilege = async ({ name, code }) => {
  const privilegeExists = await findOne({
    model: UserPrivilege,
    filter: { name, code },
  });
  if (privilegeExists) {
    throw ConflictException({
      message: "Privilege Exists",
    });
  }

  const privilege = await create({
    model: UserPrivilege,
    data: {
      name,
      code,
    },
  });
  return privilege;
};

// rotate token function
export const rotateToken = async (payload, user) => {
  const accessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000;
  const currentTime = Date.now() + 5 * 60000;

  if (currentTime < accessExpiresIn) {
    throw ConflictException({
      message: "Sorry we cannot create new login credentials while current access token still within valid time range",
    });
  }

  const { access_token, refresh_token } = await createLoginCredentials(user);
  await createRevokeToken({ payload });
  return { access_token, refresh_token };
};

// signup with Gmail function
export const siginUpWithGmail = async ({ idToken }, issuer) => {
  const { name, email, picture, email_verified } = await verifyGoogleAccount(idToken);

  if (!email_verified) {
    throw BadRequestException({ message: "Email not verified" });
  }

  const existAccount = await findOne({ model: UserModel, filter: { email } });

  if (existAccount) {
    if (existAccount.provider != providerEnum.GOOGLE) {
      throw ConflictException({ message: "Invalid account provider" });
    }
    return {
      status: 200,
      data: await createLoginCredentials(existAccount, issuer),
    };
  }

  const user = await createOne({
    model: UserModel,
    data: {
      userName: name,
      email,
      confirmEmail: new Date(),
      provider: providerEnum.GOOGLE,
      image: picture,
    },
  });

  return { status: 201, data: await createLoginCredentials(user, issuer) };
};

// logout function
export const logout = async (payload, user, inputs) => {
  const { action } = inputs.body;

  switch (action) {
    case LogoutEnum.ALL:
      user.changeCredentialsTime = new Date();
      await user.save();
      const keysCount = await keys({ prefix: userBaseRevokeTokenKey({ userId: payload.sub }) });

      if (keysCount && keysCount.length > 0) {
        await del({ key: keysCount });
      }

      break;

    default:
      await createRevokeToken({ payload });
      break;
  }

  return;
};

// forget password
export const requestForgetPasswordCode = async (inputs) => {
  const { email } = inputs.body;

  const account = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: true } },
    populate: [{ path: "privileges", select: "code" }],
  });

  if (!account) {
    throw new NotFoundException({
      message: "Invalid credentials",
    });
  }

  await sendEmailOtp({ account, subject: EmailSubjectEnum.FORGET_PASSWORD });

  return;
};

// verify forgot password
export const verifyForgotPasswordCode = async ({ email, otp }) => {
  const account = await findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: true } },
  });

  if (!account) {
    throw NotFoundException({ message: "Invalid email" });
  }

  const userKey = UserEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD });

  const hashOtp = await get({ key: userKey });
  if (!hashOtp || !(await compared({ ciperText: hashOtp, plainText: otp.toString() }))) {
    throw ConflictException({ message: "Invalid otp" });
  }
  account.confirmEmail = new Date();
  await account.save();
  await del({ key: await keys({ prefix: userKey }) });
  return account;
};

// verify forgot password
export const resetPasswordCode = async (inputs) => {
  const { email, otp, password } = inputs.body;
  const account = await verifyForgotPasswordCode({ email, otp });

  account.password = await hashed({ plainText: password });
  account.changeCredentialsTime = new Date();

  await account.save();

  const result = await Promise.all([
    keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD }) }),
    keys({ prefix: userBaseRevokeTokenKey({ userId: account._id }) }),
  ]);

  const keysToDelete = [...(result[0] || []), ...(result[1] || [])];

  if (keysToDelete.length > 0) {
    await del({ key: keysToDelete });
  }
  return account;
};
