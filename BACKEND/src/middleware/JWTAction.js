require("dotenv").config();
import jwt from "jsonwebtoken";
const nonSecurePaths = ["/logout", "/register", "/login"];
const createJWT = (payload) => {
  let key = process.env.JWT_SECRET;
  let token = null;
  try {
    token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN });
  } catch (error) {
    console.log("error createJWT", error);
  }
  return token;
};
const verifyToken = (token) => {
  let key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = jwt.verify(token, key);
  } catch (error) {
    console.log("err from verifyToken", error);
  }
  return decoded;
};
const extractToken = (req, res) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};
const checkUserJWT = (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();
  let cookies = req.cookies;
  let tokenFromHeader = extractToken(req);
  // console.log("cookies", cookies);
  if ((cookies && cookies.jwt) || tokenFromHeader) {
    let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader; ///Lấy JWT từ cookie nếu nó tồn tại, nếu không thì lấy từ header.
    let decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded; // chuỗi ở payload file loginregister
      req.token = token;
      next();
    } else {
      return res.status(401).json({
        EC: -1,
        DT: "",
        EM: "Not authenticated the user",
      });
    }
  } else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticated the user",
    });
  }
  // console.log(cookies);
};
const checkUserPermission = (req, res, next) => {
  if (nonSecurePaths.includes(req.path) || req.path === "/account")
    return next();

  if (nonSecurePaths.some((path) => req.path.includes(path))) return next();
  if (req.user) {  // nếu người dùng đã đăng nhập
    let email = req.user.email;
    let roles = req.user.groupWithRoles.Roles;
    let currentUrl = req.path;
    if (!roles || roles.length === 0) {
      return res.status(403).json({
        EC: -1,
        DT: "",
        EM: ``,
      });
    }
    let canAccess = roles.some(
      (item) => item.url === currentUrl || currentUrl.includes(item.url) //currentUrl.includes(item.url) có chứa chuỗi con ko vd: "/admin/users/edit/1".includes("/admin/users") // true
    );
    if (canAccess) {
      next();
    } else {
      return res.status(403).json({
        EC: -1,
        DT: "",
        EM: `You don't permisssion access this resource...`,
      });
    }
  } else {
    return res.status(401).json({
      EC: -1,
      DT: "",
      EM: "Not authenticated the user",
    });
  }
};
module.exports = {
  createJWT,
  verifyToken,
  checkUserJWT,
  checkUserPermission,
};
