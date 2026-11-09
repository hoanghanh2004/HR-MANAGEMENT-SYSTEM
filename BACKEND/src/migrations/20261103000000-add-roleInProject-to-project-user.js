"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Project_User", "roleInProject", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Developer",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Project_User", "roleInProject");
  },
};

