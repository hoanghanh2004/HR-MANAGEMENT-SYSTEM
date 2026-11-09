// tạo các trường trong DataTypes
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Group);
      User.belongsToMany(models.Project, {
        through: models.Project_User,
        foreignKey: "userId",
      });
      User.hasMany(models.Project_User, {
        foreignKey: "userId",
      });
      User.belongsTo(models.Department, { foreignKey: "departmentId" });
    } 
  }
  User.init(
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      address: DataTypes.STRING,
      sex: DataTypes.STRING,
      phone: DataTypes.STRING,
      groupId: DataTypes.INTEGER,
      departmentId: DataTypes.INTEGER,
      jobTitle: DataTypes.STRING,
      hireDate: DataTypes.DATEONLY,
      employmentStatus: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE",
      },
      avatar: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
