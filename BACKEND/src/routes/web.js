import express from "express";
import homeController from "../controller/homeController";
import apiController from "../controller/apiController";
import multer from "multer";
import path from "path";
var appRoot = require("app-root-path");
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log("appRoot", appRoot);
    cb(null, appRoot + "/src/public/images/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageFilter = function (req, file, cb) {
  // Kiểm tra định dạng ảnh
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    // Nếu không phải ảnh, trả về thông báo lỗi và nút quay lại
    req.fileValidationError = "Bạn chỉ được upload file ảnh";
    return cb(null, false);  // Không tiếp tục xử lý file
  }
  cb(null, true);  // Nếu đúng là ảnh, tiếp tục xử lý
};

let upload = multer({ storage: storage, fileFilter: imageFilter });

let uploadMultipleFiles = multer({
  storage: storage,
  fileFilter: imageFilter,
}).array("multiple_images", 3);

const initWebRoutes = (app) => {
  router.get("/", (req, res) => {
    res.render("index");
  });
  router.get("/user", homeController.handleUserPage);
  router.post("/user/create-user", homeController.handleCreateUser);
  router.post("/delete-user/:id", homeController.handleDeleteUser);
  router.get("/update-user/:id", homeController.getUpdateUserPage);
  router.post("/user/update-user", homeController.handleUpdateUser);

  //upload file
  router.get("/upload", homeController.getUploadFilePage);
  router.post(
    "/upload-profile-pic",
    upload.single("profile_pic"),
    homeController.handleUploadFile
  );

  router.post(
    "/upload-multiple-images",
    (req, res, next) => {
      uploadMultipleFiles(req, res, (err) => {
        if (
          err instanceof multer.MulterError &&
          err.code === "LIMIT_UNEXPECTED_FILE"
        ) {
          // handle multer file limit error here
          res.send("LIMIT_UNEXPECTED_FILE");
        } else if (err) {
          res.send(err);
        } else {
          // make sure to call next() if all was well
          next();
        }
      });
    },
    homeController.handleUploadMultipleFiles
  );
  //rest API
  // GET=>Read , POST =>Create , PUT => Update , DELETE=>Delete
  router.get("/api/test-api", apiController.testApi);
  return app.use("/", router);
};

export default initWebRoutes;
