import ClientDiet from "./model.js";
import Client from "../Clients/model.js";
import AppError from "../../utils/AppError.js";

class ClientDietRepository {
  async list(filter) {
    try {
      const clientDiets = await ClientDiet.find(filter).lean();
      return { status: 200, success: true, data: clientDiets, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const clientDiet = await ClientDiet.findOne(filter).lean();
      if (!clientDiet) {
        return new AppError("NOT_FOUND", "ClientDiet not found", 404);
      }
      return { status: 200, success: true, data: clientDiet, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(clientDietData) {
    try {
      const clientDiet = new ClientDiet(clientDietData);
      const savedClientDiet = await clientDiet.save();
      return { status: 201, success: true, data: savedClientDiet, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(clientDietId, newData) {
    try {
      const plan = await ClientDiet.findById(clientDietId);

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

  async delete(clientDietId) {
    try {
      const deletedClientDiet = await ClientDiet.findByIdAndDelete(
        clientDietId
      ).lean();
      if (!deletedClientDiet) {
        return new AppError("NOT_FOUND", "ClientDiet not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedClientDiet,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const clientDiets = await ClientDiet.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: clientDiets, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ClientDietRepository;
