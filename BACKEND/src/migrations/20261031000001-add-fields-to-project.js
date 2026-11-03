"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Project", "endDate", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Project", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "PLANNING",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Project", "status");
    await queryInterface.removeColumn("Project", "endDate");
  },
};

