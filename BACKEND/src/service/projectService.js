import db from "../models/index";

const VALID_PROJECT_STATUS = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
];

const isValidDateFormat = (dateStr) => {
  if (typeof dateStr !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const getAllProjects = async () => {
  try {
    const projects = await db.Project.findAll({
      order: [["id", "DESC"]],
    });
    return {
      EM: "Get projects success",
      EC: 0,
      DT: projects,
    };
  } catch (error) {
    console.log("getAllProjects error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const createProject = async (data) => {
  const name = typeof data?.name === "string" ? data.name.trim() : "";
  if (!name) {
    return {
      EM: "Project name is required",
      EC: 1,
      DT: "name",
    };
  }

  let status = "PLANNING";
  if (
    data?.status !== undefined &&
    data?.status !== null &&
    String(data.status).trim() !== ""
  ) {
    const trimmedStatus = String(data.status).trim();
    if (!VALID_PROJECT_STATUS.includes(trimmedStatus)) {
      return {
        EM: "Invalid project status. Allowed values: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED",
        EC: 1,
        DT: "status",
      };
    }
    status = trimmedStatus;
  }

  let startDate = null;
  if (
    data?.startDate !== undefined &&
    data?.startDate !== null &&
    String(data.startDate).trim() !== ""
  ) {
    const trimmedStartDate = String(data.startDate).trim();
    if (!isValidDateFormat(trimmedStartDate)) {
      return {
        EM: "Start date must be in YYYY-MM-DD format",
        EC: 1,
        DT: "startDate",
      };
    }
    startDate = trimmedStartDate;
  }

  let endDate = null;
  if (
    data?.endDate !== undefined &&
    data?.endDate !== null &&
    String(data.endDate).trim() !== ""
  ) {
    const trimmedEndDate = String(data.endDate).trim();
    if (!isValidDateFormat(trimmedEndDate)) {
      return {
        EM: "End date must be in YYYY-MM-DD format",
        EC: 1,
        DT: "endDate",
      };
    }
    endDate = trimmedEndDate;
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      EM: "End date cannot be earlier than start date",
      EC: 1,
      DT: "endDate",
    };
  }

  const description =
    data?.description !== undefined && data?.description !== null
      ? String(data.description).trim()
      : "";

  let customerId = null;
  if (
    data?.customerId !== undefined &&
    data?.customerId !== null &&
    data?.customerId !== ""
  ) {
    const parsedCid = Number(data.customerId);
    if (Number.isInteger(parsedCid) && parsedCid > 0) {
      customerId = parsedCid;
    }
  }

  try {
    const project = await db.Project.create({
      name,
      description,
      startDate,
      endDate,
      status,
      customerId,
    });
    return {
      EM: "Create project success",
      EC: 0,
      DT: project,
    };
  } catch (error) {
    console.log("createProject error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const updateProject = async (data) => {
  const id = Number(data && data.id);
  if (!Number.isInteger(id) || id <= 0) {
    return {
      EM: "A valid project id is required",
      EC: 1,
      DT: "id",
    };
  }

  try {
    const project = await db.Project.findByPk(id);
    if (!project) {
      return {
        EM: "Project not found",
        EC: 2,
        DT: "",
      };
    }

    const updatePayload = {};

    if (data.name !== undefined) {
      const name = typeof data.name === "string" ? data.name.trim() : "";
      if (!name) {
        return {
          EM: "Project name is required",
          EC: 1,
          DT: "name",
        };
      }
      updatePayload.name = name;
    }

    if (data.description !== undefined) {
      updatePayload.description =
        data.description !== null ? String(data.description).trim() : "";
    }

    if (data.status !== undefined && data.status !== null) {
      const trimmedStatus = String(data.status).trim();
      if (!VALID_PROJECT_STATUS.includes(trimmedStatus)) {
        return {
          EM: "Invalid project status. Allowed values: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED",
          EC: 1,
          DT: "status",
        };
      }
      updatePayload.status = trimmedStatus;
    }

    let finalStartDate = project.startDate;
    let finalEndDate = project.endDate;

    if (data.startDate !== undefined) {
      if (data.startDate === null || String(data.startDate).trim() === "") {
        finalStartDate = null;
        updatePayload.startDate = null;
      } else {
        const trimmedStartDate = String(data.startDate).trim();
        if (!isValidDateFormat(trimmedStartDate)) {
          return {
            EM: "Start date must be in YYYY-MM-DD format",
            EC: 1,
            DT: "startDate",
          };
        }
        finalStartDate = trimmedStartDate;
        updatePayload.startDate = trimmedStartDate;
      }
    }

    if (data.endDate !== undefined) {
      if (data.endDate === null || String(data.endDate).trim() === "") {
        finalEndDate = null;
        updatePayload.endDate = null;
      } else {
        const trimmedEndDate = String(data.endDate).trim();
        if (!isValidDateFormat(trimmedEndDate)) {
          return {
            EM: "End date must be in YYYY-MM-DD format",
            EC: 1,
            DT: "endDate",
          };
        }
        finalEndDate = trimmedEndDate;
        updatePayload.endDate = trimmedEndDate;
      }
    }

    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
      return {
        EM: "End date cannot be earlier than start date",
        EC: 1,
        DT: "endDate",
      };
    }

    if (data.customerId !== undefined) {
      if (data.customerId === null || data.customerId === "") {
        updatePayload.customerId = null;
      } else {
        const parsedCid = Number(data.customerId);
        updatePayload.customerId =
          Number.isInteger(parsedCid) && parsedCid > 0 ? parsedCid : null;
      }
    }

    await project.update(updatePayload);

    return {
      EM: "Update project success",
      EC: 0,
      DT: project,
    };
  } catch (error) {
    console.log("updateProject error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const deleteProject = async (id) => {
  const projectId = Number(id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return {
      EM: "A valid project id is required",
      EC: 1,
      DT: "id",
    };
  }

  try {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return {
        EM: "Project not found",
        EC: 2,
        DT: [],
      };
    }

    // Kiểm tra ràng buộc với Project_User trước khi xóa
    const assignedCount = await db.Project_User.count({
      where: { projectId: projectId },
    });

    if (assignedCount > 0) {
      return {
        EM: "Cannot delete project because it has assigned users or related records",
        EC: 1,
        DT: { assignedCount },
      };
    }

    await project.destroy();
    return {
      EM: "Delete project success",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log("deleteProject error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
};

