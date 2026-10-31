"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("User", "departmentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Department",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("User", "jobTitle", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn("User", "hireDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn("User", "employmentStatus", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "ACTIVE",
    });
    await queryInterface.addColumn("User", "avatar", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("User", "avatar");
    await queryInterface.removeColumn("User", "employmentStatus");
    await queryInterface.removeColumn("User", "hireDate");
    await queryInterface.removeColumn("User", "jobTitle");
    await queryInterface.removeColumn("User", "departmentId");
  },
};

