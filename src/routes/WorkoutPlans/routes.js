import { Router } from "express";
import Controller from "../../controllers/workoutPlansController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";
import validator from "../../utils/validator.js";
import multer from "../../middlewares/fileUploader.js";
import clientWorkoutsController from "../../controllers/clientWorkoutsController.js";
const upload = multer();

const app = Router();
app
  .route("/")
  .all(authenticate)
  .get(asyncHandler(Controller.getPlans))
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    asyncHandler(Controller.createNewPlan)
  );

app
  .route("/:id")
  .all(authenticate)
  .get(asyncHandler(Controller.getPlan))
  .patch(
    upload.fields([{ name: "image", maxCount: 1 }]),
    asyncHandler(Controller.updatePlan)
  )
  .delete(asyncHandler(Controller.deletePlan));

app
  .route("/:id/days")
  .all(authenticate)
  .post(asyncHandler(Controller.addDay))
  .get(asyncHandler(Controller.getDay))
  .patch(asyncHandler(Controller.editDay));

app
  .route("/:plan/clients/:id")
  .all(authenticate)
  .post(asyncHandler(clientWorkoutsController.assignPlan));

app.get("/coaches/:id", authenticate, asyncHandler(Controller.getCoachPlans));
export default app;
