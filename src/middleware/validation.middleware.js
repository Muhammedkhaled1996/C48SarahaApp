import { LanguageEnum } from "../common/enum/index.js";
import { BadRequestException } from "../common/exceptions/errors.exceptions.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const lang = Number(req.headers["accept-language"] ?? LanguageEnum.EN);

    const validationResult = schema(lang).safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
      files: req.files,
      file: req.file,
    });

    if (!validationResult.success) {
      throw BadRequestException({
        message: "Validation error",
        extra: validationResult.error.issues,
      });
    }

    req.validate = validationResult.data;

    next();
  };
};
