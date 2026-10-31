"use strict";

const avatarRole = {
  url: "/user/upload-avatar",
  description: "Tải lên ảnh đại diện nhân viên",
};

module.exports = {
  up: async (queryInterface) => {
    // 1. Kiểm tra nếu role chưa tồn tại thì thêm mới vào bảng Role
    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT `id`, `url` FROM `Role` WHERE `url` = :url LIMIT 1",
      {
        replacements: { url: avatarRole.url },
      }
    );

    let roleId = existingRoles.length > 0 ? existingRoles[0].id : null;

    if (!roleId) {
      await queryInterface.bulkInsert("Role", [
        {
          url: avatarRole.url,
          description: avatarRole.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const [newRoles] = await queryInterface.sequelize.query(
        "SELECT `id` FROM `Role` WHERE `url` = :url LIMIT 1",
        {
          replacements: { url: avatarRole.url },
        }
      );
      roleId = newRoles[0].id;
    }

    // 2. Gán quyền cho các nhóm có thẩm quyền quản lý User (Group 1: Admin/Dev, Group 2: Leader)
    const targetGroupIds = [1, 2];

    for (const groupId of targetGroupIds) {
      const [groups] = await queryInterface.sequelize.query(
        "SELECT `id` FROM `Group` WHERE `id` = :groupId LIMIT 1",
        {
          replacements: { groupId },
        }
      );

      if (groups.length > 0 && roleId) {
        const [existingGroupRoles] = await queryInterface.sequelize.query(
          "SELECT `id` FROM `Group_Role` WHERE `groupId` = :groupId AND `roleId` = :roleId LIMIT 1",
          {
            replacements: { groupId, roleId },
          }
        );

        if (existingGroupRoles.length === 0) {
          await queryInterface.bulkInsert("Group_Role", [
            {
              groupId: groupId,
              roleId: roleId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [roles] = await queryInterface.sequelize.query(
      "SELECT `id` FROM `Role` WHERE `url` = :url LIMIT 1",
      {
        replacements: { url: avatarRole.url },
      }
    );

    if (roles.length > 0) {
      const roleId = roles[0].id;
      await queryInterface.bulkDelete("Group_Role", { roleId });
      await queryInterface.bulkDelete("Role", { id: roleId });
    }
  },
};

