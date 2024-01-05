import DietPlan from "./model.js";
import AppError from "../../utils/appError.js";
import Client from "../Clients/model.js";
import ClientDiet from "../ClientDiets/model.js";

class DietPlanRepository {
  async list(filter) {
    try {
      const dietPlans = await DietPlan.find(filter).lean();
      return { status: 200, success: true, data: dietPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async assignPlan(clientId, planId, assignedAt) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }

      const assignedPlan = await DietPlan.findById(planId);

      if (!assignedPlan) {
        return new AppError("NOT_FOUND", "Plan not found", 404);
      }

      assignedPlan.assignees.push(clientId);
      await assignedPlan.save();

      let planData = {
        client: client._id,
        plan: assignedPlan._id,
        assignedAt,
        days: assignedPlan.days.toObject(),
      };

      const newClientPlan = new ClientDiet(planData);
      await newClientPlan.save();

      client.NutritionPlan = newClientPlan._id;
      await client.save();

      if (!newClientPlan) {
        return new AppError(
          "DATABASE_ERROR",
          "couldn't create new client plan",
          500
        );
      }

      return {
        status: 201,
        success: true,
        data: newClientPlan,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const dietPlan = await DietPlan.findOne(filter).lean();
      if (!dietPlan) {
        return new AppError("NOT_FOUND", "DietPlannot not found", 404);
      }
      return { status: 200, success: true, data: dietPlan, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(dietPlanData) {
    try {
      const dietPlan = new DietPlan(dietPlanData);
      const savedDietPlan = await dietPlan.save();
      return { status: 201, success: true, data: savedDietPlan, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(dietPlanId, newData) {
    try {
      const updatedDietPlan = await DietPlan.findByIdAndUpdate(
        dietPlanId,
        newData,
        { new: true }
      ).lean();
      if (!updatedDietPlan) {
        return new AppError("NOT_FOUND", "DietPlannot not found", 404);
      }
      return { status: 200, success: true, data: updatedDietPlan, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(dietPlanId) {
    try {
      const deletedDietPlan = await DietPlan.findByIdAndDelete(
        dietPlanId
      ).lean();
      if (!deletedDietPlan) {
        return new AppError("NOT_FOUND", "DietPlannot not found", 404);
      }
      return { status: 200, success: true, data: deletedDietPlan, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const dietPlans = await DietPlan.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: dietPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default DietPlanRepository;
