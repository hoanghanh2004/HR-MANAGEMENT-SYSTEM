import loginRegisterService from "../service/loginRegisterService";
const testApi = async (req, res) => {
  return res.status(200).json({
    message: "OK",
    data: "test API",
  });
};
const handleRegister = async (req, res) => {
  try {
    if (!req.body.email || !req.body.phone || !req.body.password) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: "1",
        DT: "",
      });
    }
    if (req.body.password && req.body.password.length < 4) {
      return res.status(200).json({
        EM: "Your password must have more than 3 letters",
        EC: "1",
        DT: "",
      });
    }
    //service: create user
    let data = await loginRegisterService.registerNewUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: "",
    });
  } catch (error) {
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const handleLogin = async (req, res) => {
  try {
    // console.log('>>>>req', req.body);
    let data = await loginRegisterService.handleUserLogin(req.body);
    //set cookie
    if (data && data.DT && data.DT.access_token) {
      res.cookie("jwt", data.DT.access_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
    }
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const handleLogout = (req, res) => {
  try {
    // console.log("Request body:", req.body); // Ghi log để kiểm tra request
    res.clearCookie("jwt");
    return res.status(200).json({
      EM: "Clear Cookie done",
      EC: 0,
      DT: "",
    });
  } catch (error) {
    console.log("Error:", error); // Log lỗi nếu có
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};

module.exports = {
  testApi,
  handleRegister,
  handleLogin,
  handleLogout,
};
