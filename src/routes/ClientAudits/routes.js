import { Router } from "express";
import Controller from "../../controllers/clientAuditsController.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { authenticate } from "../../utils/auth.service.js";

const app = Router();
app
    .route("/")
    .all(authenticate)
    .get(asyncHandler(Controller.getAudits))
    .post(asyncHandler(Controller.createNewAudits));
app
    .route("/:id")
    .all(authenticate)
    .patch(asyncHandler(Controller.updateAudits))
    .delete(asyncHandler(Controller.deleteAudits));

export default app;
