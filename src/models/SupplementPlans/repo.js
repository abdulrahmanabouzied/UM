import SupplementPlan from "./model.js";
import AppError from "../../utils/appError.js";
import Client from "../Clients/model.js";
import ClientSupplement from "../ClientSupplement/model.js";
class SupplementPlanRepository {
  async list(filter) {
    try {
      const supplementPlans = await SupplementPlan.find(filter).lean();
      return { status: 200, success: true, data: supplementPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const supplementPlan = await SupplementPlan.findOne(filter).lean();
      if (!supplementPlan) {
        return new AppError("NOT_FOUND", "SupplementPlan not found", 404);
      }
      return { status: 200, success: true, data: supplementPlan, error: null };
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

      const assignedPlan = await SupplementPlan.findById(planId);

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

      const newClientPlan = new ClientSupplement(planData);
      await newClientPlan.save();

      client.SupplementPlan = newClientPlan._id;
      client.notifications.push({
        title: "Supplement plan assigned",
        message: `you are now assigned to a supplement plan that starts on ${new Date(
          assignedAt
        ).toLocaleString()}`,
        date: new Date(),
      });
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

  async create(supplementPlanData) {
    try {
      const supplementPlan = new SupplementPlan(supplementPlanData);
      const savedSupplementPlan = await supplementPlan.save();
      return {
        status: 201,
        success: true,
        data: savedSupplementPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(supplementPlanId, newData) {
    try {
      const updatedSupplementPlan = await SupplementPlan.findByIdAndUpdate(
        supplementPlanId,
        newData,
        { new: true }
      ).lean();
      if (!updatedSupplementPlan) {
        return new AppError("NOT_FOUND", "SupplementPlan not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: updatedSupplementPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(supplementPlanId) {
    try {
      const deletedSupplementPlan = await SupplementPlan.findByIdAndDelete(
        supplementPlanId
      ).lean();
      if (!deletedSupplementPlan) {
        return new AppError("NOT_FOUND", "SupplementPlan not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedSupplementPlan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const supplementPlans = await SupplementPlan.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: supplementPlans, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default SupplementPlanRepository;
