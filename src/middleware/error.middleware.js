import { NODE_ENV } from "../config.js";

//Fixed  error  structure
export const globalErrorHandling = (error, req, res, next) => {
  const status = error.cause?.status ?? 500;
  const mood = NODE_ENV == "production";
  const defaultErrorMessage = "something went wrong Sever error";
  const displayErrorMessage = error.message || defaultErrorMessage;
  return res.status(status).json({
    error_message: mood
      ? status == 500
        ? defaultErrorMessage
        : displayErrorMessage
      : displayErrorMessage,
    cause: error.cause || undefined,
    stack: mood ? undefined : error.stack,
  });
};
