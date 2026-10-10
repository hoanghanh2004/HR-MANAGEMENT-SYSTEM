import db from "../models/index";

const isDuplicateNameError = (error) =>
  error.name === "SequelizeUniqueConstraintError" ||
  (error.original && error.original.code === "ER_DUP_ENTRY");

const normalizeName = (name) =>
  typeof name === "string" ? name.trim() : "";

const getAllDepartments = async () => {
  try {
    const departments = await db.Department.findAll({
      order: [["id", "ASC"]],
    });
    return {
      EM: "Get departments success",
      EC: 0,
      DT: departments,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const createDepartment = async (data) => {
  const name = normalizeName(data && data.name);
  if (!name) {
    return {
      EM: "Department name is required",
      EC: 1,
      DT: "name",
    };
  }

  try {
    const department = await db.Department.create({ name });
    return {
      EM: "Create department success",
      EC: 0,
      DT: department,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: isDuplicateNameError(error)
        ? "A department with this name already exists"
        : "Error from service",
      EC: 1,
      DT: isDuplicateNameError(error) ? "name" : [],
    };
  }
};

const updateDepartment = async (data) => {
  const id = Number(data && data.id);
  const name = normalizeName(data && data.name);
  if (!Number.isInteger(id) || id <= 0) {
    return {
      EM: "A valid department id is required",
      EC: 1,
      DT: "id",
    };
  }
  if (!name) {
    return {
      EM: "Department name is required",
      EC: 1,
      DT: "name",
    };
  }

  try {
    const department = await db.Department.findByPk(id);
    if (!department) {
      return {
        EM: "Department not found",
        EC: 2,
        DT: "",
      };
    }

    await department.update({ name });
    return {
      EM: "Update department success",
      EC: 0,
      DT: department,
    };
  } catch (error) {
    console.log(error);
    return {
      EM: isDuplicateNameError(error)
        ? "A department with this name already exists"
        : "Error from service",
      EC: 1,
      DT: isDuplicateNameError(error) ? "name" : [],
    };
  }
};

const deleteDepartment = async (id) => {
  const departmentId = Number(id);
  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return {
      EM: "A valid department id is required",
      EC: 1,
      DT: "id",
    };
  }

  try {
    const department = await db.Department.findByPk(departmentId);
    if (!department) {
      return {
        EM: "Department not found",
        EC: 2,
        DT: [],
      };
    }

    await department.destroy();
    return {
      EM: "Delete department success",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log(error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
