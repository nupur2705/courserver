import express from "express";
import dotenv from "dotenv";
import ErrorMiddleWare from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({ path: "./config/config.env" });
const app = express();

// Using Middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    "credentials":true,
    "origin": process.env.FRONTEND_URL,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "optionsSuccessStatus": 204
  })
);
/*Importing & using Routes */
import course from "./routes/courseRoutes.js";
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";
app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;

app.get("/", (req, res) => {
  res.send(
    `<h1>Site is Working. Click <a href=${process.env.FRONTEND_URL}>Here</a> to visit frontend.</h1>`
  );
});

app.use(ErrorMiddleWare);
