import db from "../models/index";
import {
  checkEmailExist,
  checkPhoneExist,
  hashUserPassword,
} from "./loginRegisterService";
const getAllUser = async () => {
  try {
    let users = await db.User.findAll({
      attributes: ["id", "username", "email", "phone", "sex", "address"],
      include: { model: db.Group, attributes: ["name", "description", "id"] }, //join 2 bảng với nhau user với group , lấy ra dữ liệu kết hợp cả 2 bảng
      order: [["id", "ASC"]], // tăng dần theo id
    });
    if (users) {
      return {
        EM: "Get data success !",
        EC: 0,
        DT: users,
      };
    } else {
      return {
        EM: "Not found users !",
        EC: 0,
        DT: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "something wrong width service !",
      EC: 1,
      DT: [],
    };
  }
};

const createUser = async (data) => {
  try {
    //check email, phone in form modal
    let isEmailExist = await checkEmailExist(data.email);
    if (isEmailExist === true) {
      return {
        EM: "The email is already exist !",
        EC: "1",
        DT: "email",
      };
    }
    let isPhoneExist = await checkPhoneExist(data.phone);
    if (isPhoneExist === true) {
      return {
        EM: "The phone is already exist !",
        EC: "1",
        DT: "phone", 
      };
    }
    //hash user password
    let hashPassword = hashUserPassword(data.password);
    await db.User.create({ ...data, password: hashPassword });
    return {
      EM: "Create ok !",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "something wrong width service !",
      EC: 1,
      DT: [],
    };
  }
};
const updateUser = async (data) => {
  try {
    if (!data.groupId) {
      return {
        EM: "Error with empty groupId !",
        EC: 1,
        DT: "group",
      };
    }
    let user = await db.User.findOne({
      where: { id: data.id },
    });
    if (user) {
      // UPDATE
      await user.update({
        username: data.username,
        address: data.address,
        sex: data.sex,
        groupId: data.groupId,
      });
      return {
        EM: "Update user success !",
        EC: 0,
        DT: "group",
      };
    } else {
      return {
        EM: "User not found !",
        EC: 2,
        DT: "",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "something wrong width service !",
      EC: 1,
      DT: [],
    };
  }
};
const deleteUser = async (id) => {
  try {
    let user = await db.User.findOne({
      where: { id: id },
    });
    if (user) {
      await user.destroy();
      return {
        EM: "Delete user successeds !",
        EC: 0,
        DT: [],
      };
    } else {
      return {
        EM: "User not exist !",
        EC: 2,
        DT: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service !",
      EC: 1,
      DT: [],
    };
  }
};
module.exports = {
  getAllUser,
  createUser,
  updateUser,
  deleteUser,
};
