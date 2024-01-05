import WorkoutPlan from "./model.js";
import AppError from "../../utils/appError.js";

class WorkoutPlanRepository {
  async list(filter) {
    try {
      const workoutPlans = await WorkoutPlan.find(filter).lean();
      return { status: 200, success: true, data: workoutPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const workoutPlan = await WorkoutPlan.findOne(filter).lean();
      if (!workoutPlan) {
        return new AppError("NOT_FOUND", "workoutPlan not found", 404);
      }
      return { status: 200, success: true, data: workoutPlan, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(workoutPlanData) {
    try {
      const workoutPlan = new WorkoutPlan(workoutPlanData);
      const savedWorkoutPlan = await workoutPlan.save();
      return {
        status: 201,
        success: true,
        data: savedWorkoutPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(workoutPlanId, newData) {
    try {
      const updatedWorkoutPlan = await WorkoutPlan.findByIdAndUpdate(
        workoutPlanId,
        newData,
        { new: true }
      ).lean();
      if (!updatedWorkoutPlan) {
        return new AppError("NOT_FOUND", "workoutPlan not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: updatedWorkoutPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(workoutPlanId) {
    try {
      const deletedWorkoutPlan = await WorkoutPlan.findByIdAndDelete(
        workoutPlanId
      ).lean();
      if (!deletedWorkoutPlan) {
        return new AppError("NOT_FOUND", "workoutPlan not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedWorkoutPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const workoutPlans = await WorkoutPlan.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: workoutPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default WorkoutPlanRepository;
