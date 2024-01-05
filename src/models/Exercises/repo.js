import AppError from "../../utils/appError.js";
import Exercise from "./model.js";

class ExerciseRepository {
  async list(filter) {
    try {
      const exercises = await Exercise.find(filter).lean();
      return { status: 200, success: true, data: exercises, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const exercise = await Exercise.findOne(filter).lean();
      if (!exercise) {
        return {
          status: 404,
          success: false,
          data: null,
          error: "Exercise not found",
        };
      }
      return { status: 200, success: true, data: exercise, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(exerciseData) {
    try {
      const exercise = new Exercise(exerciseData);
      const savedExercise = await exercise.save();
      return { status: 201, success: true, data: savedExercise, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(exerciseId, newData) {
    try {
      const updatedExercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        newData,
        { new: true }
      ).lean();
      if (!updatedExercise) {
        return {
          status: 404,
          success: false,
          data: null,
          error: "Exercise not found",
        };
      }
      return { status: 200, success: true, data: updatedExercise, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(exerciseId) {
    try {
      const deletedExercise = await Exercise.findByIdAndDelete(
        exerciseId
      ).lean();
      if (!deletedExercise) {
        return new AppError("NOT_FOUND", "Exercise not found", 404);
      }
      return { status: 200, success: true, data: deletedExercise, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const exercises = await Exercise.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: exercises, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ExerciseRepository;
