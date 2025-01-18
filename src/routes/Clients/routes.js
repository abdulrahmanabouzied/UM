import { Router } from "express";

const app = Router();
import Controller from "../../controllers/clientsController.js";
import { authenticate, restrictTo } from "../../utils/auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

import uploader from "../../middlewares/fileUploader.js";
const upload = uploader();

app.route("/").all(authenticate).get(Controller.getAllClients);

// Manipulate Client
app.get('/me', authenticate, Controller.getMe);

app
  .route("/:id")
  .all(authenticate)
  .patch(
    upload.fields([
      { name: "picture", maxCount: 1 },
      { name: "inbody", maxCount: 2 },
    ]),
    asyncHandler(Controller.updateClient)
  )
  .get(restrictTo('coach'), asyncHandler(Controller.getClient))
  .delete(asyncHandler(Controller.deleteClient));

// Client Plans
app.get(
  "/:id/workouts",
  authenticate,
  asyncHandler(Controller.getClientWorkoutPlan)
);
app.get(
  "/:id/nutrition",
  authenticate,
  asyncHandler(Controller.getClientDietPlan)
);
app.get(
  "/:id/nutrition/days",
  authenticate,
  asyncHandler(Controller.getDietPlanDay)
);
app.get(
  "/:id/supplements",
  authenticate,
  asyncHandler(Controller.getClientSupplementPlan)
);
app.get(
  "/:id/supplements/days",
  authenticate,
  asyncHandler(Controller.getSupplePlanDay)
);
app.get(
  "/:id/supplements/days/items",
  authenticate,
  asyncHandler(Controller.getSupplePlanDayItems)
);
// Notifications API
app
  .route("/:id/notifications")
  .all(authenticate)
  .get(asyncHandler(Controller.getNotifications))
  .delete(asyncHandler(Controller.deleteNotifications))
  .patch(asyncHandler(Controller.markSeen))
  .put(asyncHandler(Controller.markAllSeen));
app.delete(
  "/:id/notifications/delete",
  authenticate,
  asyncHandler(Controller.deleteAllNotifications)
);

// Inbody API
app
  .route("/:id/inbody")
  .all(authenticate)
  .get(asyncHandler(Controller.getInbody))
  .patch(restrictTo("coach"), asyncHandler(Controller.requestInbody));

app.get("/:id/coach", authenticate, asyncHandler(Controller.getClientCoach));
export default app;
