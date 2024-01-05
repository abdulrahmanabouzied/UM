import { Router } from "express";
import V1 from "./v1.api.routes.js";
import errorHandler from "../middlewares/errorHandler.js";

const app = Router();

app.get("/", async (req, res) => {
  res.status(200).send(`Welcome to UM..`);
});

app.use("/api/v1/", V1);

app.all("*", async (req, res, next) => {
  res.format({
    html: function () {
      res.status(404).send(`${req.originalUrl} request not found`);
    },
    json: function () {
      res.status(404).json({
        message: `${req.originalUrl} request not found`,
      });
    },
  });
});

app.use(errorHandler);

export default app;
