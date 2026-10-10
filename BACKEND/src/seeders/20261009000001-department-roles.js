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
    const rolesToInsert = departmentRoles
      .filter((role) => !existingUrls.has(role.url))
      .map((role) => ({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert("Role", rolesToInsert);
    }

    const [allDeptRoles] = await queryInterface.sequelize.query(
      "SELECT `id` FROM `Role` WHERE `url` IN (:urls)",
      {
        replacements: {
          urls: departmentRoles.map((role) => role.url),
        },
      }
    );
    const [groups] = await queryInterface.sequelize.query(
      "SELECT `id` FROM `Group` WHERE `id` = 1 LIMIT 1"
    );
    if (groups.length > 0 && allDeptRoles.length > 0) {
      const [existingGroupRoles] = await queryInterface.sequelize.query(
        "SELECT `roleId` FROM `Group_Role` WHERE `groupId` = 1 AND `roleId` IN (:roleIds)",
        {
          replacements: {
            roleIds: allDeptRoles.map((r) => r.id),
          },
        }
      );
      const existingRoleIdSet = new Set(
        existingGroupRoles.map((gr) => gr.roleId)
      );
      const groupRolesToInsert = allDeptRoles
        .filter((r) => !existingRoleIdSet.has(r.id))
        .map((r) => ({
          groupId: 1,
          roleId: r.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
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
          urls: departmentRoles.map((role) => role.url),
        },
      }
    );
    if (roles.length > 0) {
      await queryInterface.bulkDelete("Group_Role", {
        roleId: {
          [Sequelize.Op.in]: roles.map((r) => r.id),
        },
      });
    }
    await queryInterface.bulkDelete("Role", {
      url: {
        [Sequelize.Op.in]: departmentRoles.map((role) => role.url),
      },
    });
  },
};
