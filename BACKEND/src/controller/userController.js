import userApiService from "../service/userApiService";
const readFunc = async (req, res) => {
  try {
    // console.log('Cookies', req.cookies);
    //  console.log('req.user', req.user);
    let data = await userApiService.getAllUser();
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const createFunc = async (req, res) => {
  try {
    let data = await userApiService.createUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const updateFunc = async (req, res) => {
  try {
    let data = await userApiService.updateUser(req.body);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const deleteFunc = async (req, res) => {
  try {
    // console.log('req', req.body);
    let data = await userApiService.deleteUser(req.body.id);
    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EM: "error from server",
      EC: "-1",
      DT: "",
    });
  }
};
const getUserAccount = async (req, res) => {
  return res.status(200).json({
    EM: "Get User Account OK!",
    EC: 0,
    DT: {
      access_token: req.token,
      groupWithRoles: req.user.groupWithRoles,
      email: req.user.email,
      username: req.user.username,
    },
  });
};
module.exports = {
  readFunc,
  createFunc,
  updateFunc,
  deleteFunc,
  getUserAccount,
};
