import multer from "multer";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { BadRequestException } from "../../exceptions/errors.exceptions.js";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  files: ["application/pdf", "application/json"],
};

export const filePath = async ({ customPath, result = {} } = {}) => {
  await mkdir(resolve(`./assets/${customPath}`), { recursive: true });
  const uniquefilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`;
  return uniquefilePath;
};

export const localFileUpload = ({ maxFileSize = 5 } = {}) => {
  //   const storage = multer.diskStorage({
  //     destination: function (req, file, cb) {
  //       cb(null, "./assets");
  //     },
  //     filename: function (req, file, cb) {
  //       console.log({ file });
  //       cb(null, randomUUID() + file.originalname);
  //     },
  //   });

  const storage = multer.memoryStorage();

  return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};

export const proccessFile = async ({ customPath, file, validation = [] } = {}) => {
  const result = await fileTypeFromBuffer(file.buffer);
  if (!result || !validation.includes(result.mime)) {
    throw BadRequestException({ message: "Invalid file formats" });
  }
  const uniquefilePath = await filePath({ customPath, result });
  await writeFile(resolve(`./${uniquefilePath}`), file.buffer);
  file.path = uniquefilePath;
  return file;
};

export const proccessFiles = async ({ customPath, files = [], validation = [] } = {}) => {
  const readyToSave = [];

  for (const file of files) {
    const result = await fileTypeFromBuffer(file.buffer);
    if (!result || !validation.includes(result.mime)) {
      throw BadRequestException({ message: "Invalid file formats" });
    }

    const uniquefilePath = await filePath({ customPath, result });
    readyToSave.push({ file, path: uniquefilePath });
  }

  const assets = [];

  for (const { file, path } of readyToSave) {
    await writeFile(resolve(`./${path}`), file.buffer);
    file.path = path;
    assets.push(file);
  }

  return assets;
};

export const proccessFields = async ({ customPath, fields = {}, validation = [] } = {}) => {
  const readyToSave = [];

  for (const fieldName of Object.keys(fields)) {
    const fileList = Array.isArray(fields[fieldName]) ? fields[fieldName] : [fields[fieldName]];

    for (const file of fileList) {
      const result = await fileTypeFromBuffer(file.buffer);

      if (!result || !validation.includes(result.mime)) {
        throw BadRequestException({ message: "Invalid file formats" });
      }

      const uniquefilePath = await filePath({ customPath, result });
      readyToSave.push({ file, path: uniquefilePath });
    }
  }

  const assets = [];

  for (const { file, path } of readyToSave) {
    await writeFile(resolve(`./${path}`), file.buffer);
    file.path = path;
    assets.push(file);
  }

  return assets;
};

export const proccessMulterUpload = async ({ req, customPath = "general", validation = [] } = {}) => {
  if (req.file) {
    await proccessFile({ customPath, file: req.file, validation });
  } else if (Array.isArray(req.files)) {
    await proccessFiles({ customPath, files: req.files, validation });
  } else if (typeof req.files == "object" && Object.keys(req.files).length) {
    await proccessFields({ customPath, fields: req.files, validation });
  }
};



// export const proccessFile = ({ validation = [] } = {}) => {
//   return async (req, res, next) => {
//     const filePath = resolve(`./${req.file.path}`);

//     const fileBuffer = await readFile(filePath);

//     const result = await fileTypeFromBuffer(fileBuffer);
//     console.log({ f: req.file, filePath, fileBuffer, result });

//     if (!result || !validation.includes(result.mime)) {
//       await unlink(filePath);
//       next(new Error("Invalid file formats", { cause: { status: 400 } }));
//     }

//     next();
//   };
// };
