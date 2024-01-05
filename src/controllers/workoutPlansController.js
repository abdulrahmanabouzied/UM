import WorkoutPlanRepository from "../models/WorkoutPlans/repo.js";
const workoutPlanRepository = new WorkoutPlanRepository();

import {
  uploadFile,
  removeFile,
  handleFiles,
} from "../middlewares/cloudinaryUploader.js";
import AppError from "../utils/appError.js";
import WorkoutPlan from "./../models/WorkoutPlans/model.js";
class WorkoutPlansController {
  async getPlans(req, res, next) {
    const result = await workoutPlanRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getPlan(req, res, next) {
    const { id: _id } = req.params;

    const result = await workoutPlanRepository.getOne({ _id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order } = req.query;

      const plan = await WorkoutPlan.findById(id, "days").populate(
        "days.exercises.exercise"
      );

      if (!plan) {
        return next(new AppError("NOT_FOUND", "Plan not found", 404));
      }

      if (!order) {
        return res.status(200).json({
          success: true,
          status: 200,
          data: plan.days,
        });
      }

      let day = plan.days.find((day, idx) => {
        console.log(order, idx);
        return idx === +order - 1 || +day?.order === +order;
      });

      if (!day) {
        return next(new AppError("NOT_FOUND", "Day not found", 404));
      }

      console.log(day);

      res.status(200).json({
        success: true,
        status: 200,
        data: day,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCoachPlans(req, res, next) {
    const { id } = req.params;

    const result = await workoutPlanRepository.list({ coach: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  // TODO: validate the body
  async addDay(req, res, next) {
    const { id } = req.params;
    const { day } = req.body;

    console.log(day);

    if (!day) {
      return next(
        new AppError("BODY_NOT_FOUND", "a day to add is required", 400)
      );
    }

    const plan = await WorkoutPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    const found = plan.days.find((currDay) => currDay.order === day.order);

    if (found) {
      return next(
        new AppError(
          "DUPLICATE_DAY",
          "a day with this order already exists",
          400
        )
      );
    }

    plan.addDay(day);
    await plan.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: plan,
    });
  }

  async editDay(req, res, next) {
    const { id } = req.params;
    const { day: target } = req.body;
    const { order, id: dayId } = req.query;

    const plan = await WorkoutPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    if (!order && !dayId) {
      return next(
        new AppError("QUERY_NOT_FOUND", "a query to the day is required", 400)
      );
    }

    plan.days = plan.days.map((day, idx) => {
      if (
        (dayId && dayId == day._id) ||
        (order && (day?.order === +order || idx === +order - 1))
      ) {
        console.log(day);
        return Object.assign(day, target);
      }

      return day;
    });

    await plan.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: plan,
    });
  }

  async createNewPlan(req, res, next) {
    const planData = req.body;

    const files = req.files;
    let uploadedImage;

    if (files?.image) {
      uploadedImage = await handleFiles(
        planData,
        files,
        "WorkoutPlans",
        "image"
      );

      if (!uploadedImage.success) {
        return next(uploadedImage);
      }

      // exerciseData.image = uploadedImage.data;
    }

    const result = await workoutPlanRepository.create(planData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updatePlan(req, res, next) {
    const { id } = req.params;
    const newData = req.body;
    const files = req.files;
    let uploadedImage;

    const plan = await WorkoutPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }

    if (plan?.image) {
      const flushed = await removeFile("image", plan.image.public_id);
      if (!flushed.success) {
        return next(flushed);
      }
    }

    if (files?.image) {
      uploadedImage = await handleFiles(
        newData,
        files,
        "WorkoutPlans",
        "image"
      );

      if (!uploadedImage) {
        return next(uploadedImage);
      }
    }

    await plan.updateOne(newData);
    await plan.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: plan,
    });
  }

  async deletePlan(req, res, next) {
    const { id } = req.params;

    const plan = await WorkoutPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }

    if (plan?.image) {
      const flushed = await removeFile("image", plan.image.public_id);
      if (!flushed.success) {
        return next(flushed);
      }
    }

    await plan.deleteOne();

    res.status(200).json({
      success: true,
      status: 200,
      data: plan,
    });
  }
}

export default new WorkoutPlansController();
