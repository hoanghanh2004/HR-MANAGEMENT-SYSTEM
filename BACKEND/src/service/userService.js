// back end
import bcrypt from "bcryptjs";
// import Bluebird from "bluebird";
import db from "../models/index.js";
// Create the connection to database

const salt = bcrypt.genSaltSync(10);
// người dùng nhập vào tham số userPassword
const hashPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};
const createNewUser = async (email, password, username) => {
  let hashPass = hashPassword(password);
  try {
    await db.User.create({
      username: username,
      email: email,
      password: hashPass,
    });
  } catch (error) {
    console.log(">>>>>>>error: ", error);
  }
};

const getUserList = async () => {
  
  let users = [];
  // [
  //   {
  //     id: 1,
  //     email: "nguyen.an@example.com",
  //     username: "nguyenan"
  //   },
  //   {
  //     id: 2,
  //     email: "le.an@example.com",
  //     username: "lean"
  //   },
  //   {
  //     id: 3,
  //     email: "le.bach@example.com",
  //     username: "lebach"
  //   }
  // ]
  users = await db.User.findAll();
  return users;

};
const deleteUser = async (userId) => {
  await db.User.destroy({
    where: {
      id: userId,
    },
  });
};
const getUserById = async (id) => {
  let user = {};
  // {
  //   id: 54,
  //   email: "nguyen.an@example.com",
  //   username: "nguyenan"
  // }
  user = await db.User.findOne({
    where: {
      id: id,
    },
  });
  return user.get({ plain: true }); // loại bỏ bớt các thứ phụ trả ra của sequelize
};
const updateUserInfor = async (id, email, username) => {
  await db.User.update(
    { email: email, username: username },
    {
      where: { id: id },
    }
  );
};
module.exports = {
  createNewUser,
  getUserList,
  deleteUser,
  getUserById,
  updateUserInfor,
};
