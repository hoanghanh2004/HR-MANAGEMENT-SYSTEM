import multer from "multer";
import path from "path";
import fs from "fs";

// Đường dẫn lưu trữ: BACKEND/src/public/images/avatars/
const avatarDir = path.resolve(__dirname, "../public/images/avatars");

// Tự động tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionValid = allowedExtensions.includes(ext);
  const isMimeTypeValid = allowedMimeTypes.includes(file.mimetype);

  if (isExtensionValid && isMimeTypeValid) {
    cb(null, true);
  } else {
    const error = new Error(
      "Chỉ cho phép tải lên file ảnh định dạng JPG, JPEG, PNG hoặc WEBP !"
    );
    error.code = "INVALID_FILE_TYPE";
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Giới hạn tối đa 2MB
  },
  fileFilter: fileFilter,
}).single("avatar");

const handleAvatarUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          EC: 1,
          EM: "Kích thước ảnh không được vượt quá 2MB !",
          DT: "",
        });
      }
      return res.status(400).json({
        EC: 1,
        EM: `Lỗi upload file: ${err.message}`,
        DT: "",
      });
    } else if (err) {
      return res.status(400).json({
        EC: 1,
        EM: err.message || "File tải lên không hợp lệ !",
        DT: "",
      });
    }
    next();
  });
};

module.exports = {
  handleAvatarUpload,
};
