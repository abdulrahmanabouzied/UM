import { Router } from "express";
import Controller from "../../controllers/supplementsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate, restrictTo } from "../../utils/auth.service.js";
import validator from "../../utils/validator.js";
import { supplementCreateSchema } from "../../validation/Supplements/create.validation.js";
import { supplementUpdateSchema } from "../../validation/Supplements/update.validation.js";


const app = Router();

app
  .route("/")
  .all(authenticate, restrictTo("coach"))
  .get(asyncHandler(Controller.getAllItems))
  .post(validator(supplementCreateSchema), asyncHandler(Controller.createItem));

app
  .route("/:id")
  .all(authenticate)
  .patch(
    restrictTo("coach"),
    validator(supplementUpdateSchema),
    asyncHandler(Controller.updateItem)
  )
  .delete(restrictTo("coach"), asyncHandler(Controller.deleteItem))
  .get(asyncHandler(Controller.getItem));

app.get("/coaches/:id", authenticate, asyncHandler(Controller.getCoachItems));

export default app;
