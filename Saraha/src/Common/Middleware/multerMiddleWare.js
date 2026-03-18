import multer from "multer";
import path from "node:path";
import { mkdirSync, existsSync } from "node:fs";

const allowedTypes = ["image"];
const allowedExtensions = ["jpg", "jpeg", "png"];

export function localMulter({ folderName, limits }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fileName = path.resolve(`./uploads/${folderName}`);
      if (!existsSync(fileName)) {
        mkdirSync(fileName, { recursive: true });
      }
      cb(null, fileName);
    },

    filename: function (req, file, cb) {
      const ext = file.originalname.split(".")[1];
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      file.finalPath = `uploads/${folderName}/${fileName}`;
      cb(null, fileName);
    },
  });

  const fileFilter = function (req, file, cb) {
    const [type, ext] = file.mimetype.split("/");

    if (!allowedTypes.includes(type)) {
      return cb(new Error("This file type is not supported"), false);
    }

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("This extension is not supported"), false);
    }

    cb(null, true);
  };
  return multer({
    storage,
    fileFilter,
    limits,
  });
}

// {
//   fieldname: 'profilePic',
//   originalname: 'UC-035f8ec1-b2b1-4b10-92cc-451e20a878e4.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'uploads/',
//   filename: 'bdc42b53ec30da3363c29c20fbb29fe1',
//   path: 'uploads\\bdc42b53ec30da3363c29c20fbb29fe1',
//   size: 219857
// }
