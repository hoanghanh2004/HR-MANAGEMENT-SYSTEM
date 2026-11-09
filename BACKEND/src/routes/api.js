import express from "express";
import apiController from "../controller/apiController";
import userController from "../controller/userController";
import groupController from "../controller/groupController";
import roleController from "../controller/roleController";
import departmentController from "../controller/departmentController";
import projectController from "../controller/projectController";
import { checkUserJWT, checkUserPermission } from "../middleware/JWTAction";
import { handleAvatarUpload } from "../middleware/uploadMiddleware";
const router = express.Router();
/**
 *
 *
 * @param {*} app: express app
 */
// const checkUserLogin = (req,res,next) => {
//   const nonSecurePaths = ['/', '/register', '/login'];
//   if (nonSecurePaths.includes(req.path)) return next();

//   //authenticate user
//   if (user) {
//     next();
//   }else {

//   }
// }

const initAPIRoutes = (app) => {
  // GET=>Read , POST =>Create , PUT => Update , DELETE=>Delete
  // router.get("/test-api", apiController.testApi);
  //API routes
  router.all("*", checkUserJWT, checkUserPermission);
  router.post("/register", apiController.handleRegister);
  router.post("/login", apiController.handleLogin);
  router.post("/logout", apiController.handleLogout);

  //user routes
  router.get("/account", userController.getUserAccount);
  router.get("/user/read", userController.readFunc);
  router.post("/user/create", userController.createFunc);
  router.put("/user/update", userController.updateFunc);
  router.delete("/user/delete", userController.deleteFunc);
  router.post(
    "/user/upload-avatar",
    handleAvatarUpload,
    userController.uploadAvatarFunc
  );

  //roles routes
  router.get("/role/read", roleController.readFunc);
  router.post("/role/create", roleController.createFunc);
  router.put("/role/update", roleController.updateFunc);
  router.delete("/role/delete", roleController.deleteFunc);
  router.get("/role/by-group/:groupId", roleController.getRoleByGroup);
  router.post("/role/assign-to-group", roleController.assignRoleToGroup);

  //department routes
  router.get("/department/read", departmentController.readFunc);
  router.post("/department/create", departmentController.createFunc);
  router.put("/department/update", departmentController.updateFunc);
  router.delete("/department/delete", departmentController.deleteFunc);

  //project routes
  router.get("/project/read", projectController.readFunc);
  router.post("/project/create", projectController.createFunc);
  router.put("/project/update", projectController.updateFunc);
  router.delete("/project/delete", projectController.deleteFunc);

  //project assignment routes
  router.get("/project/members", projectController.getMembersFunc);
  router.get("/project/assignable-users", projectController.getAssignableUsersFunc);
  router.post("/project/assign-user", projectController.assignUserFunc);
  router.put("/project/update-user-role", projectController.updateUserRoleFunc);
  router.delete("/project/remove-user", projectController.removeUserFunc);

  //group routes
  router.get("/group/read", groupController.readFunc);
  return app.use("/api/v1/", router);
};

export default initAPIRoutes;
