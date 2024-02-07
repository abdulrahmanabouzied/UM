import SupplementPlanRepository from "../models/SupplementPlans/repo.js";
import AppError from "../utils/appError.js";
const supplementPlanRepository = new SupplementPlanRepository();
import SupplementPlan from "./../models/SupplementPlans/model.js";
class SupplementPlansController {
  async getPlans(req, res, next) {
    const result = await supplementPlanRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getPlan(req, res, next) {
    const { id } = req.params;

    const populateList = [
      "breakfast",
      "midMorning",
      "lunch",
      "eveningSnacks",
      "dinner",
    ];

    const plan = await SupplementPlan.findById(id).populate(
      populateList.map((item) => `days.${item}.supplements.item`)
    );

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: plan,
    });
  }

  async createNewPlan(req, res, next) {
    const planData = req.body;
    const result = await supplementPlanRepository.create(planData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async addDay(req, res, next) {
    const { id } = req.params;
    const { day } = req.body;

    if (!day) {
      return next(
        new AppError("BODY_NOT_FOUND", "a day to add is required", 400)
      );
    }

    const plan = await SupplementPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "Plan not found", 404));
    }

    if (!day.order) {
      day.order = plan.days.length + 1;
    } else {
      const found = plan.days.find((currDay) => currDay.order == day.order);
      if (found) {
        return new AppError(
          "DUPLICATE_DAY",
          "a day with this order already exists",
          400
        );
      }
    }

    plan.days.push(day);
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

    const plan = await SupplementPlan.findById(id);

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

  async getDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order } = req.query;

      const plan = await SupplementPlan.findById(id, "days");
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

      let populateList = [
        "breakfast",
        "midMorning",
        "lunch",
        "eveningSnacks",
        "dinner",
      ];

      await plan.populate(
        populateList.map((item) => `days.${item}.supplements.item`)
      );
      let day = plan.days.find((day, idx) => {
        console.log(order, idx);
        return idx === +order - 1 || +day?.order === +order;
      });

      if (!day) {
        return next(new AppError("NOT_FOUND", "Day not found", 404));
      }

      res.status(200).json({
        success: true,
        status: 200,
        data: day,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updatePlan(req, res, next) {
    const { id } = req.params;
    const newData = req.body;

    const plan = await SupplementPlan.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
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
    const result = await supplementPlanRepository.delete(id);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async assignPlan(req, res, next) {
    // client id
    const { id, plan } = req.params;
    const { assignedAt, endingAt } = req.body;

    if (!plan || !assignedAt) {
      return next(new AppError("planId or assignedAt is missing", 400));
    }

    const result = await supplementPlanRepository.assignPlan(
      id,
      plan,
      assignedAt,
      endingAt
    );

    if (!result.success) {
      return next(result);
    }

    res.status(result.status).json(result);
  }
}

export default new SupplementPlansController();
