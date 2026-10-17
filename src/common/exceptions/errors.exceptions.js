
//general customized error method
export const ErrorResponse = ({
  message = "Error",
  status = 400,
  extra = undefined,
} = {}) => {
  throw new Error(message, { cause: { status, extra } });
};

//error-templates
// 400 Bad Request
export const BadRequestException = ({
  message = "BadRequestException",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 400, extra });
};

// 409 Conflict و تستخدم عندما يكون هناك تعارض في البيانات، مثل محاولة إنشاء مورد موجود بالفعل.
export const ConflictException = ({
  message = "ConflictException",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 409, extra });
};

// 401 Unauthorized وتستخدم عندما يحاول المستخدم الوصول إلى مورد يتطلب مصادقة، ولكنه لم يقدم بيانات اعتماد صالحة.
export const UnauthorizedException = ({
  message = "UnauthorizedException",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 401, extra });
};

// 404 Not Found وتستخدم عندما يحاول المستخدم الوصول إلى مورد غير موجود على الخادم.
export const NotFoundException = ({
  message = "NotFoundException",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 404, extra });
};

// 403 Forbidden وت ستخدم عندما يكون لدى المستخدم صلاحيات للوصول إلى المورد، ولكنه غير مصرح له بالقيام بالإجراء المطلوب.
export const ForbiddenException = ({
  message = "ForbiddenException",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 403, extra });
};

// 429 Too Many Requests وتستخدم عندما يقوم المستخدم بإرسال عدد كبير جدًا من الطلبات في فترة زمنية قصيرة، مما يؤدي إلى حظر مؤقت.
export const TooManyRequestsException = ({
  message = "Too Many Request Exception",
  extra = undefined,
} = {}) => {
  return ErrorResponse({ message, status: 429, extra });
};