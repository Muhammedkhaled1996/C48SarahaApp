import { TokenEnum } from "../common/enum/TokenEnum.js";
import { ForbiddenException } from "../common/exceptions/errors.exceptions.js";
import { decodeToken } from "../common/security/token.security.js";

export const bearerAuth = async ({req, tokenType = TokenEnum.Access}) => {
  const { authorization } = req.headers;
  const { user, payload } = await decodeToken({ authorization, tokenType });
  req.user = user;
  req.payload = payload;
};

export const authentication = (tokenType = TokenEnum.Access) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    await bearerAuth({req, tokenType});

    next();
  };
};

export const authorization = (userRole) => {
  return async (req, res, next) => {
    const user = req.user?.user || req.user;
    const userPrivileges = user?.privileges || [];

    const hasPermission = userPrivileges.some((pre) => (pre?.code || pre) >= userRole);

    if (!userPrivileges.length || !hasPermission) {
      throw ForbiddenException({ message: "Forbidden: Access Denied" });
    }
    next();
  };
};
