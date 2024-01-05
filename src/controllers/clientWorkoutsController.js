import ClientWorkoutRepository from "../models/ClientWorkouts/repo.js";
const clientWorkoutRepository = new ClientWorkoutRepository();

import AppError from "../utils/appError.js";

import ClientWorkout from "../models/ClientWorkouts/model.js";
// import Client from "./../models/Clients/model.js";

class ClientWorkoutsController {
  async getClientWorkouts(req, res, next) {
    const result = await clientWorkoutRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  // refresh the dates of the plan
  async refreshPlanState(req, res, next) {
    const { id } = req.params;

    const plan = await ClientWorkout.findById(id);
    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }
    plan.checkDays();
    plan.checkState();
    await plan.save();

    res.status(200).json({
      status: 200,
      success: true,
      data: plan,
    });
  }

  async getPlan(req, res, next) {
    const { id } = req.params;
    const plan = await ClientWorkout.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: plan,
    });
  }

  async createNewClientWorkouts(req, res, next) {
    const workoutData = req.body;
    const result = await clientWorkoutRepository.create(workoutData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async assignPlan(req, res, next) {
    // client id
    const { id } = req.params;
    const { plan, assignedAt } = req.body;

    if (!plan || !assignedAt) {
      return next(new AppError("planId or assignedAt is missing", 400));
    }

    const result = await clientWorkoutRepository.assignPlan(
      id,
      plan,
      assignedAt
    );

    if (!result.success) {
      return next(result);
    }

    res.status(result.status).json(result);
  }

  async updateClientWorkouts(req, res, next) {
    const { id } = req.params;
    const { planData } = req.body;

    try {
      const plan = await ClientWorkout.findById(id);

      if (!plan) {
        return next(new AppError("NOT_FOUND", "plan not found", 404));
      }

      await plan.updateOne(planData);
      plan.clacDates();
      await plan.save();
      console.log(plan);

      res.status(200).json({
        status: 200,
        success: true,
        data: plan,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deleteClientWorkouts(req, res, next) {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("INVALID_ID", "id parameter is required", 400));
    }

    try {
      const plan = await ClientWorkout.findById(id)
        .populate("client")
        .populate("plan");

      if (!plan) {
        return next(new AppError("NOT_FOUND", "plan not found", 404));
      }

      plan.client.WorkoutPlan = null;
      await plan.client.save();

      plan.plan.assignees = plan.plan.assignees.filter((assignee) => {
        return assignee.toString() != plan.client._id.toString();
      });
      await plan.plan.save();

      await plan.deleteOne();

      res.status(200).json({
        status: 200,
        success: true,
        message: "plan deleted",
      });
    } catch (error) {
      return next(error);
    }
  }

  async getDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order } = req.query;

      const plan = await ClientWorkout.findById(id, "days").populate(
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

      // plan.days[day.order - 1].

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

  async addDay(req, res, next) {
    const { id } = req.params;
    const { day } = req.body;

    console.log(day);

    const plan = await ClientWorkout.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    if (!day) {
      return next(
        new AppError("BODY_NOT_FOUND", "a day to add is required", 400)
      );
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
    console.log(plan.days.length);
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

    const plan = await ClientWorkout.findById(id);

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

  async startDay(req, res, next) {
    const { id, order } = req.params;
    const plan = await ClientWorkout.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    if (!order) {
      return next(
        new AppError("QUERY_NOT_FOUND", "a query to the day is required", 400)
      );
    }

    if (order > plan.days.length) {
      return next(
        new AppError(
          "INVALID_ORDER",
          "a day with this order does not exist",
          400
        )
      );
    }

    if (plan.days[order - 1] && plan.days[order - 1].order == order)
      await plan.days[order - 1].startDay();
    else {
      plan.days = plan.days.map(async (day, idx) => {
        if (order == day.order) {
          await plan.days[idx].startDay();
        }
        return day;
      });
    }
    await plan.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: "day started successfully",
    });
  }
}

export default new ClientWorkoutsController();
