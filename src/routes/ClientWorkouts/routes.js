import { Router } from "express";
import Controller from "../../controllers/clientWorkoutsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";

const app = Router();
app
  .route("/")
  .all(authenticate)
  .get(asyncHandler(Controller.getClientWorkouts));

app
  .route("/:id/days")
  .all(authenticate)
  .post(asyncHandler(Controller.addDay))
  .get(asyncHandler(Controller.getDay))
  .patch(asyncHandler(Controller.editDay));

app.patch("/:id/days/:order", authenticate, asyncHandler(Controller.startDay));

app
  .route("/:id")
  .all(authenticate)
  .get(asyncHandler(Controller.getPlan))
  .patch(asyncHandler(Controller.updateClientWorkouts))
  .put(asyncHandler(Controller.refreshPlanState))
  .delete(asyncHandler(Controller.deleteClientWorkouts));

export default app;
