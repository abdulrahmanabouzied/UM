import { Router } from "express";
const app = Router();

import ClientAuth from "./Clients/auth.routes.js";
import CoachAuth from "./Coaches/auth.routes.js";

import ClientRoutes from "./Clients/routes.js";
import CoachRoutes from "./Coaches/routes.js";

import BlogRoutes from "./Blogs/routes.js";
import ClientAuditsRoutes from "./ClientAudits/routes.js";

import ExercisesRoutes from "./Exercises/routes.js";
import SupplementsRoutes from "./Supplements/routes.js";
import IngredientsRoutes from "./Ingredients/routes.js";

import WorkoutPlansRoutes from "./WorkoutPlans/routes.js";
import ClientWorkoutsRoutes from "./ClientWorkouts/routes.js";
import SupplementsPlansRoutes from "./SupplementPlans/routes.js";
import ClientSupplementRoutes from "./ClientSupplement/routes.js";
import DietPlansRoutes from "./DietPlans/routes.js";
import ClientDietsRoutes from "./ClientDiets/routes.js";

// auth routes
app.use("/clients/auth", ClientAuth);
app.use("/coaches/auth", CoachAuth);

// roles
app.use("/clients", ClientRoutes);
app.use("/coaches", CoachRoutes);

// role-related routes
app.use("/blogs", BlogRoutes);
app.use("/client-audits", ClientAuditsRoutes);

// exercises-related routes
app.use("/exercises", ExercisesRoutes);
app.use("/workout-plans", WorkoutPlansRoutes);
app.use("/client-workouts", ClientWorkoutsRoutes);

// exercises-related routes
app.use("/ingredients", IngredientsRoutes);
app.use("/diet-plans", DietPlansRoutes);
app.use("/client-diets", ClientDietsRoutes);

// exercises-related routes
app.use("/supplements", SupplementsRoutes);
app.use("/supplement-plans", SupplementsPlansRoutes);
app.use("/client-supplements", ClientSupplementRoutes);

export default app;
