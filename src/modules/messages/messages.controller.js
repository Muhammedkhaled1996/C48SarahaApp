import { Router } from "express";
import { successResponce } from "./../../common/utils/success.responce.js";
import { createMessage, deleteMesssage, getAllMessages, getMessageById } from "./messages.services.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";
import { fileValidation, localFileUpload } from "../../common/utils/index.js";
import * as validators from "./messages.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication, bearerAuth } from "../../middleware/authentication.middleware.js";
import { decodeToken } from "../../common/security/token.security.js";

const router = Router({ caseSensitive: true, strict: true });

// create message
router.post(
  "/",
  async (req, res, next) => {
    if (req.headers["authorization"]) {
      await bearerAuth({ req });
    }
    next();
  },
  uploadMiddleware({
    multerMiddleware: localFileUpload().array("attachments", 3),
    validation: fileValidation.image,
    customPath: "messeges",
    isRequired: false,
  }),
  validation(validators.createMessage),
  async (req, res, next) => {
    const data = await createMessage(req.body, req.files, req.user);
    return successResponce({ res, data, status: 201 });
  },
);

// get all user message
router.get("/", authentication(), validation(validators.allMessages), async (req, res, next) => {
  const data = await getAllMessages(req.user, req.validate?.query);
  return successResponce({ res, data });
});

// get message by id
router.get("/:messageId", authentication(), validation(validators.deleteMessage), async (req, res, next) => {
  const data = await getMessageById(req.user, req.validate?.params  );
  return successResponce({ res, data });
});

// delete message
router.delete("/:messageId", authentication(), validation(validators.deleteMessage), async (req, res, next) => {
  const data = await deleteMesssage(req.user, req.validate?.params);
  return successResponce({ res, data });
});
export default router;
