"use strict";

const projectAssignmentRoles = [
  { url: "/project/members", description: "Xem danh sách thành viên dự án" },
  {
    url: "/project/assignable-users",
    description: "Xem danh sách nhân sự có thể phân công",
  },
  {
    url: "/project/assign-user",
    description: "Phân công nhân sự vào dự án",
  },
  {
    url: "/project/update-user-role",
    description: "Cập nhật vai trò nhân sự trong dự án",
  },
  {
    url: "/project/remove-user",
    description: "Xóa nhân sự khỏi dự án",
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Kiểm tra các quyền đã tồn tại trong bảng Role để tránh tạo trùng lặp
    const [existingRoles] = await queryInterface.sequelize.query(
      "SELECT `id`, `url` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: projectAssignmentRoles.map((role) => role.url),
        },
      }
    );
    const existingUrlMap = new Map(
      existingRoles.map((role) => [role.url, role.id])
    );

    const rolesToInsert = projectAssignmentRoles
      .filter((role) => !existingUrlMap.has(role.url))
      .map((role) => ({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("Role", rolesToInsert);
    }

    // 2. Lấy toàn bộ ID của các quyền mới
    const [allAssignmentRoles] = await queryInterface.sequelize.query(
      "SELECT `id`, `url` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: projectAssignmentRoles.map((role) => role.url),
        },
      }
    );

    // 3. Xác định chính xác nhóm quản trị (Admin/Dev) và trưởng dự án (PM/Leader)
    const [targetGroups] = await queryInterface.sequelize.query(
      "SELECT `id`, `name` FROM `Group` WHERE `name` IN ('Admin', 'PM', 'Dev', 'Leader') OR `id` IN (1, 2)"
    );

    if (targetGroups.length > 0 && allAssignmentRoles.length > 0) {
      const targetGroupIds = targetGroups.map((g) => g.id);
      const targetRoleIds = allAssignmentRoles.map((r) => r.id);

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
        for (const role of allAssignmentRoles) {
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
          urls: projectAssignmentRoles.map((role) => role.url),
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
        [Sequelize.Op.in]: projectAssignmentRoles.map((role) => role.url),
      },
    });
  },
};

