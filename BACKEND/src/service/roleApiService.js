import { where } from "sequelize/lib/sequelize";
import db from "../models/index";
const createNewRoles = async (roles) => {
  try {
    // const testarr = [
    //     {url: 'test1',description: 'abc'},
    //     {url: '/user/update',description: 'abc'}
    // ]
    let currentRoles = await db.Role.findAll({
      attributes: ["url", "description"],
      raw: true,
    });
    // const results = testarr.filter(({ url: url1 }) =>
    // !currentRoles.some(({ url: url2 }) => url1 === url2));
    const persists = roles.filter(
      ({ url: url1 }) => !currentRoles.some(({ url: url2 }) => url1 === url2)
    ); 
    if (persists.length === 0) {
      return {
        EM: "Nothing to create...",
        EC: -1,
        DT: [],
      };
    }
    await db.Role.bulkCreate(persists);
    return {
      EM: `Create success ${persists.length} roles...`,
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "something wrong with service !",
      EC: 1,
      DT: [],
    };
  }
};
const getAllRoles = async () => {
  try {
    let data = await db.Role.findAll({
      order: [["id", "DESC"]],
    });
    return {
      EM: "Get all role success !",
      EC: 0,
      DT: data,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "something wrong width service !",
      EC: 1,
      DT: [],
    };
  }
};
const deleteRole = async (id) => {
  try {
    let Role = await db.Role.findOne({
      where: { id: id },
    });
    if (Role) {
      await Role.destroy();
      return {
        EM: "Delete Role Successeds !",
        EC: 0,
        DT: [],
      };
    } else {
      return {
        EM: "Role not exist !",
        EC: 2,
        DT: [],
      };
    }
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service !",
      EC: 1,
      DT: [],
    };
  }
};
const getRoleByGroup = async (id) => {
  try {
    if (!id) {
      return {
        EM: "Not found any roles!",
        EC: 0,
        DT: [],
      };
    }
    let roles = await db.Group.findOne({
      where: { id: id },
      attributes: ["id", "name", "description"],
      include: {
        model: db.Role,
        attributes: ["id", "url", "description"],
        through: { attributes: [] },
      },
    });
    return {
      EM: "Get Role by group Successeds !",
      EC: 0,
      DT: roles,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service !",
      EC: 1,
      DT: [],
    };
  }
};
const assignRoleToGroup = async (data) => {
  try {
    //data = {groupId: 4, groupRoles: [{},{}]}
    await db.Group_Role.destroy({
      where: {groupId: +data.groupId}     // xóa những bảng ghi co group tương ứng
    })
    await db.Group_Role.bulkCreate(data.groupRoles)
    return {
      EM: "Assign Role to Group Successeds !",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service !",
      EC: 1,
      DT: [],
    };
  }
};
module.exports = {
  createNewRoles,
  getAllRoles,
  deleteRole,
  getRoleByGroup,
  assignRoleToGroup,
};
