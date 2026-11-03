"use strict";

const projectRoles = [
  { url: "/project/read", description: "Xem danh sách dự án" },
  { url: "/project/create", description: "Tạo dự án mới" },
  { url: "/project/update", description: "Cập nhật dự án" },
  { url: "/project/delete", description: "Xóa dự án" },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Kiểm tra các quyền đã tồn tại trong bảng Role để tránh tạo trùng lặp
    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT `id`, `url` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: projectRoles.map((role) => role.url),
        },
      }
    );
    const existingUrlMap = new Map(existingRoles.map((role) => [role.url, role.id]));

    const rolesToInsert = projectRoles
      .filter((role) => !existingUrlMap.has(role.url))
      .map((role) => ({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("Role", rolesToInsert);
    }

    // 2. Lấy toàn bộ ID của các quyền Project (bao gồm quyền đã có từ trước hoặc vừa thêm)
    const [allProjectRoles] = await queryInterface.sequelize.query(
      "SELECT `id`, `url` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: projectRoles.map((role) => role.url),
        },
      }
    );

    // 3. Xác định chính xác nhóm quản trị (Admin/Dev) và trưởng dự án (PM/Leader) từ CSDL
    const [targetGroups] = await queryInterface.sequelize.query(
      "SELECT `id`, `name` FROM `Group` WHERE `name` IN ('Admin', 'PM', 'Dev', 'Leader') OR `id` IN (1, 2)"
    );

    if (targetGroups.length > 0 && allProjectRoles.length > 0) {
      const targetGroupIds = targetGroups.map((g) => g.id);
      const targetRoleIds = allProjectRoles.map((r) => r.id);

      const [existingGroupRoles] = await queryInterface.sequelize.query(
        "SELECT `groupId`, `roleId` FROM `Group_Role` WHERE `groupId` IN (:groupIds) AND `roleId` IN (:roleIds)",
        {
          replacements: {
            groupIds: targetGroupIds,
            roleIds: targetRoleIds,
          },
        }
      );

      const existingSet = new Set(
        existingGroupRoles.map((gr) => `${gr.groupId}_${gr.roleId}`)
      );

      const groupRolesToInsert = [];
      for (const group of targetGroups) {
        for (const role of allProjectRoles) {
          const key = `${group.id}_${role.id}`;
          if (!existingSet.has(key)) {
            groupRolesToInsert.push({
              groupId: group.id,
              roleId: role.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }

      if (groupRolesToInsert.length > 0) {
        await queryInterface.bulkInsert("Group_Role", groupRolesToInsert);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const [roles] = await queryInterface.sequelize.query(
      "SELECT `id` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: projectRoles.map((role) => role.url),
        },
      }
    );
    if (roles.length > 0) {
      const roleIds = roles.map((r) => r.id);
      await queryInterface.bulkDelete("Group_Role", {
        roleId: {
          [Sequelize.Op.in]: roleIds,
        },
      });
    }
    await queryInterface.bulkDelete("Role", {
      url: {
        [Sequelize.Op.in]: projectRoles.map((role) => role.url),
      },
    });
  },
};

