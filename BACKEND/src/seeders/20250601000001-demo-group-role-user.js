"use strict";
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Group
    await queryInterface.bulkInsert(
      "Group",
      [
        { id: 1, name: "Admin", description: "Quản trị hệ thống, toàn quyền" },
        { id: 2, name: "PM", description: "Trưởng dự án, điều phối nhân sự và dự án" },
        { id: 3, name: "Staff", description: "Nhân viên, quyền hạn cơ bản" },
      ],
      {}
    );

    // 2. Role — url KHÔNG có tiền tố /api/v1 (middleware so khớp theo req.path đã bị cắt prefix)
    await queryInterface.bulkInsert(
      "Role",
      [
        { url: "/user/read", description: "Xem danh sách người dùng" },
        { url: "/user/create", description: "Tạo người dùng mới" },
        { url: "/user/update", description: "Cập nhật người dùng" },
        { url: "/user/delete", description: "Xóa người dùng" },
        { url: "/role/read", description: "Xem danh sách quyền" },
        { url: "/role/create", description: "Tạo quyền mới" },
        { url: "/role/update", description: "Cập nhật quyền" },
        { url: "/role/delete", description: "Xóa quyền" },
        { url: "/role/assign-to-group", description: "Gán quyền cho nhóm" },
        { url: "/role/by-group", description: "Xem quyền theo nhóm" },
        { url: "/group/read", description: "Xem danh sách nhóm" },
      ],
      {}
    );

    // 3. User mẫu — mật khẩu: 123456 (đã hash bằng bcryptjs)
    await queryInterface.bulkInsert(
      "User",
      [
        { email: "admin@example.com", password: bcrypt.hashSync("123456", salt), username: "admin", phone: "0900000001", groupId: 1 },
        { email: "pm@example.com", password: bcrypt.hashSync("123456", salt), username: "pm01", phone: "0900000002", groupId: 2 },
        { email: "staff@example.com", password: bcrypt.hashSync("123456", salt), username: "staff01", phone: "0900000003", groupId: 3 },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("User", null, {});
    await queryInterface.bulkDelete("Role", null, {});
    await queryInterface.bulkDelete("Group", null, {});
  },
};
