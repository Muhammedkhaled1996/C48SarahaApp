import { BadRequestException } from "../common/exceptions/errors.exceptions.js";
import { proccessMulterUpload } from "../common/utils/index.js";

export const uploadMiddleware = ({
  isRequired = true,
  multerMiddleware,
  customPath = "general",
  validation = [],
} = {}) => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (error) => {
      if (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
        return;
      }

      try {
        if (
          isRequired &&
          !req.file &&
          !(Array.isArray(req.files) && req.files.length) &&
          !(typeof req.files == "object" && Object.keys(req.files)?.length)
        ) {
          next(BadRequestException({ message: "file is required" }));
          return;
        }

        await proccessMulterUpload({ customPath, validation, req });
        next();
      } catch (error) {
        next(new Error(error.message, { cause: { status: 400 } }));
      }
    });
  };
};
