//server render back end
import userService from "../service/userService.js";
import multer from "multer";
// const handleHelloWorld = (req, res) => {
//   return res.render("home.ejs");
// };

const handleUserPage = async (req, res) => {
  let userList = await userService.getUserList(); // Lấy dữ liệu user từ service
  return res.render("user.ejs", { userList }); // Truyền vào view
};

const handleCreateUser = (req, res) => {
  //   const email = req.body.email;
  // const password = req.body.password;
  // const username = req.body.username;
  
  // destructuring assignment
  const { email, password, username } = req.body;
  // console.log('check>>>>>', req.body);
  userService.createNewUser(email, password, username);
  return res.redirect("/user");
};
const handleDeleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id);
  // console.log("req.params.id",req.params.id)
  return res.redirect("/user");
};
const getUpdateUserPage = async (req, res) => {
  let id = req.params.id;
  let user = await userService.getUserById(id);
  let userData = {};
  userData = user;
  return res.render("user-update.ejs", { userData });
};
const handleUpdateUser = async (req, res) => {
  let email = req.body.email;
  let username = req.body.username;
  let id = req.body.id;
  await userService.updateUserInfor(id, email, username);
  return res.redirect("/user");
};

/// upload file

let getUploadFilePage = async (req, res) => {
  return res.render("uploadFile.ejs");
};

let handleUploadFile = async (req, res) => {
  if (req.fileValidationError) {
    return res.send(`
      <h3 style="color: red;">${req.fileValidationError}</h3>
      <hr/>
      <a href="/upload" style="font-size: 18px;">Quay lại trang Upload</a>
    `);
  } else if (!req.file) {
    return res.send(`
      <h3 style="color: red;">Vui lòng chọn ảnh để tải lên</h3>
      <hr/>
      <a href="/upload" style="font-size: 18px;">Quay lại trang Upload</a>
    `);
  }

  // Hiển thị ảnh đã tải lên nếu có
  res.send(
    `<h1 style="color: green;">Chúc mừng bạn đã tải thành công lên ảnh này ! <br /> Ảnh sẽ được lưu vào trong Server:</h1> <hr/><img src="/images/${req.file.filename}" width="500"> <a href="/upload" style="font-size: 18px;">Quay lại trang Upload</a>`
  );
};

let handleUploadMultipleFiles = async (req, res) => {
  if (req.fileValidationError) {
    return res.send(req.fileValidationError);
  } else if (!req.files) {
    return res.send(`
      <h1 style="color: red;">Vui lòng chọn ảnh để tải lên</h1>
      <hr/>
      <a href="/upload" style="font-size: 18px;">Quay lại trang Upload</a>
    `);
  }

  let result = "Bạn đã tải lên các ảnh sau: <hr />";
  const files = req.files;
  let index, len;

  // Hiển thị tất cả ảnh đã tải lên
  for (index = 0, len = files.length; index < len; ++index) {
    result += `<img src="/image/${files[index].filename}" width="300" style="margin-right: 20px;">`;
  }
  result += '<hr/><a href="/upload">Tải lên thêm ảnh</a>';
  res.send(result);
};

module.exports = {
  // handleHelloWorld,
  handleUserPage,
  handleCreateUser,
  handleDeleteUser,
  getUpdateUserPage,
  handleUpdateUser,
  getUploadFilePage,
  handleUploadFile,
  handleUploadMultipleFiles,
};
