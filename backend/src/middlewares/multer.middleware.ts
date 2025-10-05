import multer from "multer";

export const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },       // 100 MB

}).array("media", 10); 