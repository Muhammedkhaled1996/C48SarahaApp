import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { SignatureLevelEnum, TokenEnum } from "../../common/enum/index.js";
import { findOne } from "./../repository/index.js";
import {
  ACCESS_SYSTEM_TOKEN_SIGNATURE,
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_USER_TOKEN_SIGNATURE,
  REFRESH_SYSTEM_TOKEN_SIGNATURE,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_USER_TOKEN_SIGNATURE,
} from "./../../config.js";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../exceptions/errors.exceptions.js";
import { UserModel } from "../../DB/module/user.model.js";
import { exists, keys, set } from "../services/index.js";
import { decryption } from "./encryption.security.js";

export const userBaseKey = ({ userId }) => {
  return `User::${userId.toString()}`;
};

export const userBaseRevokeTokenKey = ({ userId }) => {
  return `${userBaseKey({ userId })}::Revoke_Token`;
};

export const userRevokeTokenKey = ({ userId, jti }) => {
  return `${userBaseRevokeTokenKey({ userId })}::${jti}`;
};

export const createRevokeToken = async ({ payload }) => {
  const currentTime = Math.floor(Date.now() / 1000);

  const expiryTime = payload.iat + Number(REFRESH_TOKEN_EXPIRES_IN);
  const ttl = expiryTime - currentTime;

  if (ttl <= 0) return;

  await set({
    key: userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }),
    value: payload.jti,
    ttl: Math.ceil(ttl),
  });
};

export const privileges = (user) => {
  return user?.privileges?.map((pre) => pre?.code) || [];
};

export const generateToken = async ({
  payload,
  secret = ACCESS_USER_TOKEN_SIGNATURE,
  options = { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({ token, secret = ACCESS_USER_TOKEN_SIGNATURE } = {}) => {
  return jwt.verify(token, secret);
};

export const detectSignatureLevel = async (isSystemOrAdmin) => {
  return isSystemOrAdmin ? SignatureLevelEnum.Admin : SignatureLevelEnum.User;
};

export const getSignatures = async (levelOrKey = SignatureLevelEnum.User) => {
  const signatures = {
    access_signature: "",
    refresh_signature: "",
  };

  const isAdmin =
    levelOrKey === true || levelOrKey === SignatureLevelEnum.Admin || levelOrKey === "Admin" || levelOrKey === "System";

  if (isAdmin) {
    signatures.access_signature = ACCESS_SYSTEM_TOKEN_SIGNATURE;
    signatures.refresh_signature = REFRESH_SYSTEM_TOKEN_SIGNATURE;
  } else {
    signatures.access_signature = ACCESS_USER_TOKEN_SIGNATURE;
    signatures.refresh_signature = REFRESH_USER_TOKEN_SIGNATURE;
  }

  return signatures;
};

export const createLoginCredentials = async (user, issuer = "SarahaApp") => {
  const signatureLevel = await detectSignatureLevel(privileges(user)?.some((code) => code >= 8000));

  const signatures = await getSignatures(signatureLevel);

  const jwtid = randomUUID();

  const userRoles = user?.privileges.map((pre) => pre?.code);
  const access_token = await generateToken({
    payload: { userRoles },
    secret: signatures.access_signature,
    options: {
      subject: user._id.toString(),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      jwtid,
      issuer: issuer,
    },
  });

  const refresh_token = await generateToken({
    payload: { userRoles },
    secret: signatures.refresh_signature,
    options: {
      subject: user._id.toString(),
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      jwtid,
      issuer: issuer,
    },
  });
  return { access_token, refresh_token };
};

export const decodeToken = async ({ model = UserModel, authorization, tokenType = TokenEnum.Access } = {}) => {
  if (!authorization) {
    throw UnauthorizedException({
      message: "Authorization header is missing",
    });
  }
  const [bearerKey, token] = authorization.split(" ");
  if (!bearerKey || !token) {
    throw UnauthorizedException({
      message: "missing token parts",
    });
  }

  const payloadView = jwt.decode(token);

  const signatures = await getSignatures(payloadView?.userRoles.includes(8000));

  const payload = await verifyToken({
    token,
    secret: tokenType === TokenEnum.Refresh ? signatures.refresh_signature : signatures.access_signature,
  });

  if (!payload?.sub || !payload?.iat) {
    throw BadRequestException({
      message: "invalid token payload",
    });
  }

  if (await exists({ key: userRevokeTokenKey({ userId: payload?.sub, jti: payload?.jti }) })) {
    throw UnauthorizedException();
  }

  const user = await findOne({
    model,
    filter: { _id: payload?.sub },
    options: {},
    populate: [{ path: "privileges", select: "code" }],
  });

  if (!user) {
    throw NotFoundException({
      message: "Not registered account",
    });
  }

  if ((user.changeCredentialsTime?.getTime() || 0) > payload.iat * 1000) {
    throw UnauthorizedException();
  }

  if (user.phone && user.phone.includes("::")) {
    user.phone = await decryption(user.phone);
  }

  return { user, payload };
};
