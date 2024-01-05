import ExerciseRepository from "../models/Exercises/repo.js";
const exerciseRepository = new ExerciseRepository();

import {
  uploadFile,
  removeFile,
  handleFiles,
} from "../middlewares/cloudinaryUploader.js";
import AppError from "../utils/AppError.js";
import Exercise from "../models/Exercises/model.js";

class ExercisesController {
  async getAllItems(req, res, next) {
    const result = await exerciseRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getCoachItems(req, res, next) {
    const { id } = req.params;
    const result = await exerciseRepository.list({ coach: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getItem(req, res, next) {
    const { id } = req.params;
    const result = await exerciseRepository.getOne({ _id: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async createItem(req, res, next) {
    const exerciseData = req.body;
    const files = req.files;
    let uploadedImage;

    if (files.image) {
      uploadedImage = await handleFiles(
        exerciseData,
        files,
        "Exercises",
        "image"
      );

      if (!uploadedImage.success) {
        return next(uploadedImage);
      }

      // exerciseData.image = uploadedImage.data;
    }

    const result = await exerciseRepository.create(exerciseData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateItem(req, res, next) {
    const { id } = req.params;
    const newData = req.body;
    const files = req.files;
    let uploadedImage;

    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return next(new AppError("NOT_FOUND", "exercise not found", 404));
    }

    if (files?.image) {
      if (exercise?.image) {
        const flushed = await removeFile("image", exercise.image.public_id);
        if (!flushed.success) {
          return next(flushed);
        }
      }

      uploadedImage = await handleFiles(newData, files, "Exercises", "image");

      if (!uploadedImage) {
        return next(uploadedImage);
      }
    }

    await exercise.updateOne(newData);
    await exercise.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: exercise,
    });
  }

  async deleteItem(req, res, next) {
    const { id } = req.params;

    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return next(new AppError("NOT_FOUND", "exercise not found", 404));
    }

    if (exercise?.image) {
      const flushed = await removeFile("image", exercise.image.public_id);
      if (!flushed.success) {
        return next(flushed);
      }
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      status: 200,
      data: exercise,
    });
  }
}

export default new ExercisesController();
