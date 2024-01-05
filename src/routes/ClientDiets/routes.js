import { Router } from "express";
import Controller from "../../controllers/clientDietsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";

const app = Router();
app.route("/").all(authenticate).get(asyncHandler(Controller.getClientDiets));

app
  .route("/:id/days")
  .all(authenticate)
  .post(asyncHandler(Controller.addDay))
  .get(asyncHandler(Controller.getDay))
  .patch(asyncHandler(Controller.editDay));

app.patch(
  "/:plan/days/:day/items/:item",
  authenticate,
  Controller.doneWithItem
);

app
  .route("/:id")
  .all(authenticate)
  .get(asyncHandler(Controller.getPlan))
  .patch(asyncHandler(Controller.updatePlan))
  .put(asyncHandler(Controller.refreshPlanState))
  .delete(asyncHandler(Controller.deletePlan));

export default app;
