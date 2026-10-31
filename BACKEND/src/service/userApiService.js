import db from "../models/index";
import { Op } from "sequelize";
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

const getUserWithPagination = async (page, limit, keyword) => {
  try {
    let parsedPage = parseInt(page, 10);
    let parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || parsedPage < 1) {
      parsedPage = 1;
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 10;
    } else if (parsedLimit > 100) {
      parsedLimit = 100;
    }

    let offset = (parsedPage - 1) * parsedLimit;

    let whereCondition = {};
    if (keyword !== undefined && keyword !== null) {
      let trimmedKeyword = String(keyword).trim();
      if (trimmedKeyword.length > 0) {
        // Escape %, _ and \ for MySQL LIKE pattern
        let escapedKeyword = trimmedKeyword.replace(/[%_\\]/g, "\\$&");
        whereCondition = {
          [Op.or]: [
            { username: { [Op.like]: `%${escapedKeyword}%` } },
            { email: { [Op.like]: `%${escapedKeyword}%` } },
            { phone: { [Op.like]: `%${escapedKeyword}%` } },
            { address: { [Op.like]: `%${escapedKeyword}%` } },
          ],
        };
      }
    }

    let { count, rows } = await db.User.findAndCountAll({
      where: whereCondition,
      offset: offset,
      limit: parsedLimit,
      attributes: ["id", "username", "email", "phone", "sex", "address"],
      include: { model: db.Group, attributes: ["name", "description", "id"] },
      order: [["id", "ASC"]],
      distinct: true,
    });

    let totalPages = count > 0 ? Math.ceil(count / parsedLimit) : 0;

    return {
      EM: "Get users with pagination success",
      EC: 0,
      DT: {
        totalRows: count,
        totalPages: totalPages,
        users: rows,
      },
    };
  } catch (error) {
    console.log("getUserWithPagination error:", error);
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
  getUserWithPagination,
  createUser,
  updateUser,
  deleteUser,
};
