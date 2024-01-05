import { Router } from "express";
import Controller from "../../controllers/blogsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";
import { blogCreateSchema } from "../../validation/Blogs/create.validation.js";
import { blogUpdateSchema } from "../../validation/Blogs/update.validation.js";
import validator from "../../utils/validator.js";
import { restrictTo } from "../../utils/auth.service.js";
import multer from "../../middlewares/fileUploader.js";
const upload = multer();

const app = Router();
app
  .route("/")
  .all(authenticate)
  .get(asyncHandler(Controller.getAllItems))
  .post(
    [restrictTo("coach"), upload.fields([{ name: "coverImage", maxCount: 1 }])],
    validator(blogCreateSchema),
    asyncHandler(Controller.createItem)
  );

app
  .route("/:id")
  .all(authenticate, restrictTo("coach"))
  .patch(
    [
      restrictTo("coach"),
      upload.fields([{ name: "coverImage", maxCount: 1 }]),
      validator(blogUpdateSchema),
    ],
    asyncHandler(Controller.updateItem)
  )
  .delete(restrictTo("coach"), asyncHandler(Controller.deleteItem))
  .get(asyncHandler(Controller.getItem));

app.delete(
  "/",
  authenticate,
  restrictTo("coach"),
  asyncHandler(Controller.deleteItems)
);

app.get(
  "/coaches/:coach",
  authenticate,
  asyncHandler(Controller.getCoachBlogs)
);

export default app;
