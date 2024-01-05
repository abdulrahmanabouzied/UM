import { Router } from "express";
const app = Router();

import Controller from "../../controllers/coachesController.js";
import { authenticate } from "../../utils/auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

import uploader from "../../middlewares/fileUploader.js";
const upload = uploader();

app
  .route("/:id")
  .all(authenticate)
  .get(asyncHandler(Controller.getCoach))
  .patch(
    upload.fields([
      { name: "picture", maxCount: 1 },
      { name: "bannerImage", maxCount: 1 },
    ]),
    asyncHandler(Controller.updateCoach)
  )
  .delete(asyncHandler(Controller.deleteCoach));

// Notifications API
app
  .route("/:id/notifications")
  .all(authenticate)
  .get(asyncHandler(Controller.getNotifications))
  .delete(asyncHandler(Controller.deleteNotifications))
  .patch(asyncHandler(Controller.markSeen))
  .put(asyncHandler(Controller.markAllSeen))
  .post(asyncHandler(Controller.sendNotificationToClient));

app.get("/:id/clients", authenticate, asyncHandler(Controller.getAllClients));
app.get("/:id/blogs", authenticate, asyncHandler(Controller.getAllBlogs));
app.get(
  "/:id/notifications",
  authenticate,
  asyncHandler(Controller.getNotifications)
);

export default app;
