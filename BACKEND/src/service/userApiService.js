import db from "../models/index";
import { Op } from "sequelize";
import {
  checkEmailExist,
  checkPhoneExist,
  hashUserPassword,
} from "./loginRegisterService";

const VALID_EMPLOYMENT_STATUS = ["ACTIVE", "PROBATION", "RESIGNED", "LEAVE"];

const isValidDateFormat = (dateStr) => {
  if (typeof dateStr !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const getAllUser = async () => {
  try {
    let users = await db.User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "sex",
        "address",
        "departmentId",
        "jobTitle",
        "hireDate",
        "employmentStatus",
        "avatar",
      ],
      include: [
        { model: db.Group, attributes: ["name", "description", "id"] },
        { model: db.Department, attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
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
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "sex",
        "address",
        "departmentId",
        "jobTitle",
        "hireDate",
        "employmentStatus",
        "avatar",
      ],
      include: [
        { model: db.Group, attributes: ["name", "description", "id"] },
        { model: db.Department, attributes: ["id", "name"] },
      ],
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
    // 1. Kiểm tra các trường bắt buộc
    if (!data.email) {
      return {
        EM: "The email is required !",
        EC: 1,
        DT: "email",
      };
    }
    if (!data.phone) {
      return {
        EM: "The phone is required !",
        EC: 1,
        DT: "phone",
      };
    }
    if (!data.password) {
      return {
        EM: "The password is required !",
        EC: 1,
        DT: "password",
      };
    }

    // Check email exist
    let isEmailExist = await checkEmailExist(data.email);
    if (isEmailExist === true) {
      return {
        EM: "The email is already exist !",
        EC: 1,
        DT: "email",
      };
    }
    // Check phone exist
    let isPhoneExist = await checkPhoneExist(data.phone);
    if (isPhoneExist === true) {
      return {
        EM: "The phone is already exist !",
        EC: 1,
        DT: "phone",
      };
    }

    // 2. Validate departmentId nếu có truyền
    let finalDepartmentId = null;
    if (
      data.departmentId !== undefined &&
      data.departmentId !== null &&
      data.departmentId !== ""
    ) {
      const deptId = Number(data.departmentId);
      if (!Number.isInteger(deptId) || deptId <= 0) {
        return {
          EM: "Phòng ban không hợp lệ !",
          EC: 1,
          DT: "departmentId",
        };
      }
      const department = await db.Department.findByPk(deptId);
      if (!department) {
        return {
          EM: "Phòng ban không tồn tại trong hệ thống !",
          EC: 1,
          DT: "departmentId",
        };
      }
      finalDepartmentId = deptId;
    }

    // 3. Validate employmentStatus
    let finalEmploymentStatus = "ACTIVE";
    if (
      data.employmentStatus !== undefined &&
      data.employmentStatus !== null &&
      data.employmentStatus !== ""
    ) {
      const status = String(data.employmentStatus).trim().toUpperCase();
      if (!VALID_EMPLOYMENT_STATUS.includes(status)) {
        return {
          EM: "Trạng thái làm việc không hợp lệ ! Chỉ chấp nhận: ACTIVE, PROBATION, RESIGNED, LEAVE",
          EC: 1,
          DT: "employmentStatus",
        };
      }
      finalEmploymentStatus = status;
    }

    // 4. Validate jobTitle
    let finalJobTitle = null;
    if (data.jobTitle !== undefined && data.jobTitle !== null) {
      const title = String(data.jobTitle).trim();
      if (title.length > 255) {
        return {
          EM: "Chức danh không được vượt quá 255 ký tự !",
          EC: 1,
          DT: "jobTitle",
        };
      }
      finalJobTitle = title || null;
    }

    // 5. Validate hireDate
    let finalHireDate = null;
    if (
      data.hireDate !== undefined &&
      data.hireDate !== null &&
      data.hireDate !== ""
    ) {
      const dateStr = String(data.hireDate).trim();
      if (!isValidDateFormat(dateStr)) {
        return {
          EM: "Ngày vào làm không hợp lệ ! Định dạng chuẩn: YYYY-MM-DD",
          EC: 1,
          DT: "hireDate",
        };
      }
      finalHireDate = dateStr;
    }

    // 6. Validate avatar
    let finalAvatar = null;
    if (data.avatar !== undefined && data.avatar !== null) {
      finalAvatar = String(data.avatar).trim() || null;
    }

    // 7. Hash user password
    let hashPassword = hashUserPassword(data.password);

    // 8. Whitelisted creation (Không dùng ...data để ngăn chặn chèn trường ngoài kiểm soát)
    const newUser = await db.User.create({
      email: data.email,
      username: data.username || "",
      password: hashPassword,
      address: data.address || "",
      sex: data.sex || "",
      phone: data.phone,
      groupId: data.groupId,
      departmentId: finalDepartmentId,
      jobTitle: finalJobTitle,
      hireDate: finalHireDate,
      employmentStatus: finalEmploymentStatus,
      avatar: finalAvatar,
    });

    return {
      EM: "Create ok !",
      EC: 0,
      DT: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        departmentId: newUser.departmentId,
        jobTitle: newUser.jobTitle,
        hireDate: newUser.hireDate,
        employmentStatus: newUser.employmentStatus,
        avatar: newUser.avatar,
      },
    };
  } catch (error) {
    console.log("createUser error:", error);
    return {
      EM: "something wrong width service !",
      EC: 1,
      DT: [],
    };
  }
};

const updateUser = async (data) => {
  try {
    if (!data.id) {
      return {
        EM: "User id is required !",
        EC: 1,
        DT: "id",
      };
    }
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
    if (!user) {
      return {
        EM: "User not found !",
        EC: 2,
        DT: "",
      };
    }

    // Whitelist cập nhật, bảo toàn dữ liệu cũ nếu request không truyền trường tương ứng
    const updateData = {};

    // 1. username
    if (data.username !== undefined) {
      updateData.username = data.username;
    }

    // 2. address
    if (data.address !== undefined) {
      updateData.address = data.address;
    }

    // 3. sex
    if (data.sex !== undefined) {
      updateData.sex = data.sex;
    }

    // 4. groupId
    if (data.groupId !== undefined) {
      updateData.groupId = data.groupId;
    }

    // 5. departmentId
    if (data.departmentId !== undefined) {
      if (data.departmentId === null || data.departmentId === "") {
        updateData.departmentId = null;
      } else {
        const deptId = Number(data.departmentId);
        if (!Number.isInteger(deptId) || deptId <= 0) {
          return {
            EM: "Phòng ban không hợp lệ !",
            EC: 1,
            DT: "departmentId",
          };
        }
        const department = await db.Department.findByPk(deptId);
        if (!department) {
          return {
            EM: "Phòng ban không tồn tại trong hệ thống !",
            EC: 1,
            DT: "departmentId",
          };
        }
        updateData.departmentId = deptId;
      }
    }

    // 6. jobTitle
    if (data.jobTitle !== undefined) {
      if (data.jobTitle === null) {
        updateData.jobTitle = null;
      } else {
        const title = String(data.jobTitle).trim();
        if (title.length > 255) {
          return {
            EM: "Chức danh không được vượt quá 255 ký tự !",
            EC: 1,
            DT: "jobTitle",
          };
        }
        updateData.jobTitle = title || null;
      }
    }

    // 7. hireDate
    if (data.hireDate !== undefined) {
      if (data.hireDate === null || data.hireDate === "") {
        updateData.hireDate = null;
      } else {
        const dateStr = String(data.hireDate).trim();
        if (!isValidDateFormat(dateStr)) {
          return {
            EM: "Ngày vào làm không hợp lệ ! Định dạng chuẩn: YYYY-MM-DD",
            EC: 1,
            DT: "hireDate",
          };
        }
        updateData.hireDate = dateStr;
      }
    }

    // 8. employmentStatus
    if (data.employmentStatus !== undefined) {
      if (data.employmentStatus === null || data.employmentStatus === "") {
        return {
          EM: "Trạng thái làm việc không được để trống !",
          EC: 1,
          DT: "employmentStatus",
        };
      }
      const status = String(data.employmentStatus).trim().toUpperCase();
      if (!VALID_EMPLOYMENT_STATUS.includes(status)) {
        return {
          EM: "Trạng thái làm việc không hợp lệ ! Chỉ chấp nhận: ACTIVE, PROBATION, RESIGNED, LEAVE",
          EC: 1,
          DT: "employmentStatus",
        };
      }
      updateData.employmentStatus = status;
    }

    // 9. avatar
    if (data.avatar !== undefined) {
      if (data.avatar === null) {
        updateData.avatar = null;
      } else {
        updateData.avatar = String(data.avatar).trim() || null;
      }
    }

    // Thực hiện update với danh sách whitelist
    await user.update(updateData);

    return {
      EM: "Update user success !",
      EC: 0,
      DT: "group",
    };
  } catch (error) {
    console.log("updateUser error:", error);
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
