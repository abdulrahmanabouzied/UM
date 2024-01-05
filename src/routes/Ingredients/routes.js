import { Router } from "express";
import Controller from "../../controllers/ingredientsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate, restrictTo } from "../../utils/auth.service.js";
import validator from "../../utils/validator.js";
import { ingredientCreateSchema } from "../../validation/Ingredients/create.validation.js";
import { ingredientUpdateSchema } from "../../validation/Ingredients/update.validation.js";

const app = Router();
app
  .route("/")
  .all(authenticate, restrictTo("coach"))
  .get(asyncHandler(Controller.getAllItems))
  .post(validator(ingredientCreateSchema), asyncHandler(Controller.createItem));

app
  .route("/:id")
  .all(authenticate)
  .patch(
    restrictTo("coach"),
    validator(ingredientUpdateSchema),
    asyncHandler(Controller.updateItem)
  )
  .delete(restrictTo("coach"), asyncHandler(Controller.deleteItem))
  .get(asyncHandler(Controller.getItem));

app.get("/coaches/:id", authenticate, asyncHandler(Controller.getCoachItems));

export default app;
