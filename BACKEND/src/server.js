import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import bodyParser from "body-parser";
import initAPIRoutes from "./routes/api";
import configCors from "./config/cors";
import cookieParser from "cookie-parser";
// import { createJWT, verifyToken } from "./middleware/JWTAction";
// import connection from "./config/connectDB";
require("dotenv").config();
const port = process.env.PORT || 8081;
const app = express();
// config cors
configCors(app);
configViewEngine(app);
// configBodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//config cookieParser
app.use(cookieParser())
//te
// createJWT();
// let decodedData = verifyToken(
//   ""
// );
// console.log('decodedData', decodedData);
// init all web routes
initWebRoutes(app);
initAPIRoutes(app);

app.use((req, res) => {
  //trong express use được coi là middleware, chạy từ trên xuống dưới, thằng trên trả ra kết quả rồi thì sẽ không chạy thằng dưới nữa
  return res.send("404 NOT FOUND");
});
app.listen(port, () => {
  console.log(`App is running at the port ${port}`);
});
