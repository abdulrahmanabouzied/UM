import { Router } from "express";
import Controller from "../../controllers/exercisesController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";
import { restrictTo } from "../../utils/auth.service.js";
import { exerciseCreateSchema } from "../../validation/Exercises/create.validation.js";
import { exerciseUpdateSchema } from "../../validation/Exercises/update.validation.js";
import validator from "../../utils/validator.js";
import multer from "../../middlewares/fileUploader.js";
const upload = multer();

const app = Router();
app
  .route("/")
  .all(authenticate, restrictTo("coach"))
  .get(asyncHandler(Controller.getAllItems))
  .post(
    upload.fields([{ name: "image", maxCount: 1 }]),
    validator(exerciseCreateSchema),
    asyncHandler(Controller.createItem)
  );

app
  .route("/:id")
  .all(authenticate)
  .patch(
    restrictTo("coach"),
    upload.fields([{ name: "image", maxCount: 1 }]),
    validator(exerciseUpdateSchema),
    asyncHandler(Controller.updateItem)
  )
  .delete(restrictTo("coach"), asyncHandler(Controller.deleteItem))
  .get(asyncHandler(Controller.getItem));

app.get("/coaches/:id", authenticate, asyncHandler(Controller.getCoachItems));

export default app;
