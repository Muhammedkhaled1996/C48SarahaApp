import { Router } from "express";

import { Profile, update } from "./users.services.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { fileValidation, localFileUpload, successResponce } from "../../common/utils/index.js";
import { uploadMiddleware } from "../../middleware/multer.middleware.js";

const router = Router({ caseSensitive: true, strict: true });

router.get("/", authentication(), async (req, res, next) => {
  const data = await Profile(req.user);
  return successResponce({ res, data });
});

router.patch("/", authentication(), async (req, res, next) => {
  const data = await update(req.user, req.body);
  return successResponce({ res, data });
});

router.patch(
  "/profile-image",
  authentication(),
  uploadMiddleware({
    isRequired: false,
    multerMiddleware: localFileUpload({ maxFileSize: 5 }).single("image"),
    customPath: "user",
    validation: fileValidation.image,
  }),
  async (req, res, next) => {
    req.user.image = req.file?.finalPath || req.files?.[0].finalPath;
    await req.user.save();
    return successResponce({ res, data: {user: req.user} });
  },
);

export default router;
