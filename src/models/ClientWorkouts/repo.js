import ClientWorkout from "./model.js";
import Client from "../Clients/model.js";
import WorkoutPlan from "../WorkoutPlans/model.js";

import AppError from "../../utils/appError.js";

class ClientWorkoutRepository {
  async list(filter) {
    try {
      const clientWorkouts = await ClientWorkout.find(filter).lean();
      return { status: 200, success: true, data: clientWorkouts, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const clientWorkout = await ClientWorkout.findOne(filter).lean();
      if (!clientWorkout) {
        return new AppError("NOT_FOUND", "ClientWorkout not found", 404);
      }
      return { status: 200, success: true, data: clientWorkout, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(clientWorkoutData) {
    try {
      const clientWorkout = new ClientWorkout(clientWorkoutData);
      const savedClientWorkout = await clientWorkout.save();
      return {
        status: 201,
        success: true,
        data: savedClientWorkout,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  /**
   * assignPlan - make new ClientWorkoutPlan
   * @param {String} clientId
   * @param {String} planId
   * @param {Date} assignedAt
   * @returns {Object | AppError} - response object
   */
  async assignPlan(clientId, planId, assignedAt) {
    try {
      const client = await Client.findById(clientId);

      if (!client) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }

      const assignedPlan = await WorkoutPlan.findById(planId);

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

      const newClientPlan = new ClientWorkout(planData);
      await newClientPlan.save();

      client.WorkoutPlan = newClientPlan._id;
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

  async update(clientWorkoutId, newData) {
    try {
      const plan = await ClientWorkout.findById(clientWorkoutId);

      if (!plan) {
        return new AppError("NOT_FOUND", "ClientWorkout not found", 404);
      }

      plan.updateOne(newData);
      await plan.save();

      return {
        status: 200,
        success: true,
        data: plan,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(clientWorkoutId) {
    try {
      const deletedClientWorkout = await ClientWorkout.findByIdAndDelete(
        clientWorkoutId
      ).lean();
      if (!deletedClientWorkout) {
        return new AppError("NOT_FOUND", "ClientWorkout found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedClientWorkout,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const clientWorkouts = await ClientWorkout.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: clientWorkouts, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ClientWorkoutRepository;
