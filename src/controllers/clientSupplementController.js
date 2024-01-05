import ClientSupplement from "../models/ClientSupplement/model.js";
import ClientSupplementRepository from "../models/ClientSupplement/repo.js";
import AppError from "../utils/appError.js";

const clientSupplementRepository = new ClientSupplementRepository();

class ClientSupplementController {
  async getClientSupplement(req, res, next) {
    const result = await clientSupplementRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getPlan(req, res, next) {
    const { id } = req.params;
    const plan = await ClientSupplement.findById(id);

    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }

    res.status(200).json({
      status: 200,
      success: true,
      data: plan,
    });
  }

  async refreshPlanState(req, res, next) {
    const { id } = req.params;

    const plan = await ClientSupplement.findById(id);
    if (!plan) {
      return next(new AppError("NOT_FOUND", "plan not found", 404));
    }
    plan.checkState();
    await plan.save();

    res.status(200).json({
      status: 200,
      success: true,
      data: plan.state,
    });
  }

  async createNewClientSupplement(req, res, next) {
    const dietData = req.body;
    const result = await ClientSupplementRepository.create(dietData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updatePlan(req, res, next) {
    const { id } = req.params;
    const { planData } = req.body;

    try {
      const plan = await ClientSupplement.findById(id);

      if (!plan) {
        return next(new AppError("NOT_FOUND", "plan not found", 404));
      }

      await plan.updateOne(planData);
      if (planData?.assignedAt) {
        plan.assignedAt = new Date(planData.assignedAt);
        plan.checkState();
        planData.assignedAt = undefined;
      }

      if (planData?.days) {
        plan.days = Object.assign(plan.days, planData.days);
      }
      await plan.save();
      console.log("edited plan", plan.assignedAt, plan.state);

      res.status(200).json({
        status: 200,
        success: true,
        data: plan,
      });
    } catch (error) {
      return next(error);
    }
  }

  async deletePlan(req, res, next) {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("INVALID_ID", "id parameter is required", 400));
    }

    try {
      const plan = await ClientSupplement.findById(id)
        .populate("client")
        .populate("plan");

      if (!plan) {
        return next(new AppError("NOT_FOUND", "plan not found", 404));
      }

      plan.client.SupplementPlan = null;
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
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order, date } = req.query;
      let day;

      let populateList = [
        "breakfast",
        "midMorning",
        "lunch",
        "eveningSnacks",
        "dinner",
      ];

      const plan = await ClientSupplement.findById(id, "days").populate(
        populateList.map((item) => `days.${item}.supplements.item`)
      );

      if (!plan) {
        return next(new AppError("NOT_FOUND", "Plan not found", 404));
      }

      if (!order && !date) {
        return res.status(200).json({
          success: true,
          status: 200,
          data: plan.days,
        });
      }

      if (date) {
        day = plan.getDayByDate(date);
      } else {
        day = plan.days.find((day, idx) => {
          console.log(order, idx);
          return idx === +order - 1 || +day?.order === +order;
        });
      }

      if (!day) {
        return next(new AppError("NOT_FOUND", "Day not found", 404));
      }

      console.log(day);

      res.status(200).json({
        success: true,
        status: 200,
        data: day,
      });
    } catch (err) {
      return next(new AppError(err.name, err.message, 500));
    }
  }

  async addDay(req, res, next) {
    const { id } = req.params;
    const { day } = req.body;

    console.log(day);

    const plan = await ClientSupplement.findById(id);

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

    const plan = await ClientSupplement.findById(id);

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

  async doneWithItem(req, res, next) {
    try {
      const { plan: id, day: dayId, item: itemId } = req.params;
      // const { day: target } = req.body;
      const { meal, done } = req.query;

      if (!dayId || !itemId || !meal) {
        return next(
          new AppError("QUERY_NOT_FOUND", "a query to the day is required", 400)
        );
      }

      const plan = await ClientSupplement.findByIdAndUpdate(
        id,
        {
          $set: {
            [`days.$[outer].${meal}.supplements.$[elem].done`]: done ?? true,
          },
        },
        {
          arrayFilters: [
            {
              "outer._id": dayId,
            },
            {
              "elem._id": itemId,
            },
          ],
          new: true,
        }
      );

      if (!plan) {
        return next(new AppError("NOT_FOUND", "Plan not found", 404));
      }

      // await plan.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: plan,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 404));
    }
  }
}

export default new ClientSupplementController();
