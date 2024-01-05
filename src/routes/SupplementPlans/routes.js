import { Router } from "express";
import Controller from "../../controllers/supplementPlansController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";

const app = Router();
app
  .route("/")
  .all(authenticate)
  .get(asyncHandler(Controller.getPlans))
  .post(asyncHandler(Controller.createNewPlan));

app
  .route("/:id")
  .all(authenticate)
  .patch(asyncHandler(Controller.updatePlan))
  .get(asyncHandler(Controller.getPlan))
  .delete(asyncHandler(Controller.deletePlan));

app
  .route("/:id/days")
  .all(authenticate)
  .post(asyncHandler(Controller.addDay))
  .get(asyncHandler(Controller.getDay))
  .patch(asyncHandler(Controller.editDay));

app.post(
  "/:plan/clients/:id",
  authenticate,
  asyncHandler(Controller.assignPlan)
);

app.get("/coaches/:id", authenticate, asyncHandler(Controller.getCoachPlans));
export default app;
