"use strict";

const departmentRoles = [
  { url: "/department/read", description: "Xem danh sách phòng ban" },
  { url: "/department/create", description: "Tạo phòng ban" },
  { url: "/department/update", description: "Cập nhật phòng ban" },
  { url: "/department/delete", description: "Xóa phòng ban" },
];

module.exports = {
  up: async (queryInterface) => {
    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT `url` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: departmentRoles.map((role) => role.url),
        },
      }
    );
    const existingUrls = new Set(existingRoles.map((role) => role.url));
    const rolesToInsert = departmentRoles.filter(
      (role) => !existingUrls.has(role.url)
    );

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("Role", rolesToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Role", {
      url: {
        [Sequelize.Op.in]: departmentRoles.map((role) => role.url),
      },
    });
  },
};
