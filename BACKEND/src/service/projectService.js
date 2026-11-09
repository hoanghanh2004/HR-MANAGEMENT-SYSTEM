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

const getProjectMembers = async (rawProjectId) => {
  const projectId = Number(rawProjectId);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return {
      EM: "Mã dự án không hợp lệ",
      EC: 1,
      DT: [],
    };
  }

  try {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return {
        EM: "Dự án không tồn tại",
        EC: 2,
        DT: [],
      };
    }

    const assignments = await db.Project_User.findAll({
      where: { projectId },
      include: [
        {
          model: db.User,
          attributes: [
            "id",
            "username",
            "email",
            "phone",
            "sex",
            "jobTitle",
            "avatar",
            "departmentId",
            "employmentStatus",
          ],
          include: [
            {
              model: db.Department,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    const members = assignments.map((item) => {
      const u = item.User || {};
      return {
        id: u.id,
        userId: item.userId,
        projectId: item.projectId,
        projectUserId: item.id,
        username: u.username || "",
        email: u.email || "",
        phone: u.phone || "",
        sex: u.sex || "",
        jobTitle: u.jobTitle || "",
        avatar: u.avatar || null,
        department: u.Department ? u.Department.name : "",
        employmentStatus: u.employmentStatus || "",
        roleInProject: item.roleInProject || "Developer",
        assignedAt: item.createdAt,
      };
    });

    return {
      EM: "Lấy danh sách thành viên dự án thành công",
      EC: 0,
      DT: members,
    };
  } catch (error) {
    console.log("getProjectMembers error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const getAssignableUsers = async (rawProjectId) => {
  const projectId = Number(rawProjectId);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    return {
      EM: "Mã dự án không hợp lệ",
      EC: 1,
      DT: [],
    };
  }

  try {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return {
        EM: "Dự án không tồn tại",
        EC: 2,
        DT: [],
      };
    }

    const assigned = await db.Project_User.findAll({
      where: { projectId },
      attributes: ["userId"],
    });

    const assignedUserIds = assigned.map((a) => a.userId).filter(Boolean);

    const whereCondition = {};
    if (assignedUserIds.length > 0) {
      whereCondition.id = {
        [db.Sequelize.Op.notIn]: assignedUserIds,
      };
    }

    const users = await db.User.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "username",
        "email",
        "phone",
        "sex",
        "jobTitle",
        "avatar",
        "departmentId",
        "employmentStatus",
      ],
      include: [
        {
          model: db.Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      username: u.username || "",
      email: u.email || "",
      phone: u.phone || "",
      sex: u.sex || "",
      jobTitle: u.jobTitle || "",
      avatar: u.avatar || null,
      department: u.Department ? u.Department.name : "",
      employmentStatus: u.employmentStatus || "",
    }));

    return {
      EM: "Lấy danh sách nhân viên có thể phân công thành công",
      EC: 0,
      DT: formattedUsers,
    };
  } catch (error) {
    console.log("getAssignableUsers error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const assignUserToProject = async (data) => {
  const projectId = Number(data && data.projectId);
  const userId = Number(data && data.userId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return {
      EM: "Mã dự án không hợp lệ",
      EC: 1,
      DT: "projectId",
    };
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    return {
      EM: "Vui lòng chọn nhân viên cần phân công",
      EC: 1,
      DT: "userId",
    };
  }

  const roleInProject =
    data.roleInProject !== undefined &&
    data.roleInProject !== null &&
    String(data.roleInProject).trim() !== ""
      ? String(data.roleInProject).trim()
      : "Developer";

  try {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return {
        EM: "Dự án không tồn tại",
        EC: 2,
        DT: "",
      };
    }

    const user = await db.User.findByPk(userId);
    if (!user) {
      return {
        EM: "Nhân viên không tồn tại",
        EC: 2,
        DT: "",
      };
    }

    const existing = await db.Project_User.findOne({
      where: { projectId, userId },
    });

    if (existing) {
      return {
        EM: "Nhân viên đã được phân công vào dự án này",
        EC: 1,
        DT: "",
      };
    }

    const assignment = await db.Project_User.create({
      projectId,
      userId,
      roleInProject,
    });

    return {
      EM: "Phân công nhân sự vào dự án thành công",
      EC: 0,
      DT: assignment,
    };
  } catch (error) {
    console.log("assignUserToProject error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const updateUserRoleInProject = async (data) => {
  const projectId = Number(data && data.projectId);
  const userId = Number(data && data.userId);
  const projectUserId = Number(data && (data.projectUserId || data.id));

  if (!data || !data.roleInProject || !String(data.roleInProject).trim()) {
    return {
      EM: "Vai trò trong dự án không được để trống",
      EC: 1,
      DT: "roleInProject",
    };
  }

  const newRole = String(data.roleInProject).trim();

  try {
    let assignment = null;
    if (Number.isInteger(projectUserId) && projectUserId > 0) {
      assignment = await db.Project_User.findByPk(projectUserId);
    } else if (
      Number.isInteger(projectId) &&
      projectId > 0 &&
      Number.isInteger(userId) &&
      userId > 0
    ) {
      assignment = await db.Project_User.findOne({
        where: { projectId, userId },
      });
    } else {
      return {
        EM: "Thiếu thông tin phân công cần cập nhật",
        EC: 1,
        DT: "",
      };
    }

    if (!assignment) {
      return {
        EM: "Không tìm thấy thông tin phân công nhân viên trong dự án",
        EC: 2,
        DT: "",
      };
    }

    assignment.roleInProject = newRole;
    await assignment.save();

    return {
      EM: "Cập nhật vai trò thành viên thành công",
      EC: 0,
      DT: assignment,
    };
  } catch (error) {
    console.log("updateUserRoleInProject error:", error);
    return {
      EM: "Error from service",
      EC: 1,
      DT: [],
    };
  }
};

const removeUserFromProject = async (data) => {
  const projectId = Number(data && data.projectId);
  const userId = Number(data && data.userId);
  const projectUserId = Number(data && (data.projectUserId || data.id));

  try {
    let assignment = null;
    if (Number.isInteger(projectUserId) && projectUserId > 0) {
      assignment = await db.Project_User.findByPk(projectUserId);
    } else if (
      Number.isInteger(projectId) &&
      projectId > 0 &&
      Number.isInteger(userId) &&
      userId > 0
    ) {
      assignment = await db.Project_User.findOne({
        where: { projectId, userId },
      });
    } else {
      return {
        EM: "Thiếu thông tin thành viên cần xóa khỏi dự án",
        EC: 1,
        DT: "",
      };
    }

    if (!assignment) {
      return {
        EM: "Không tìm thấy thông tin phân công nhân viên trong dự án",
        EC: 2,
        DT: "",
      };
    }

    await assignment.destroy();

    return {
      EM: "Xóa thành viên khỏi dự án thành công",
      EC: 0,
      DT: [],
    };
  } catch (error) {
    console.log("removeUserFromProject error:", error);
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
  getProjectMembers,
  getAssignableUsers,
  assignUserToProject,
  updateUserRoleInProject,
  removeUserFromProject,
};

