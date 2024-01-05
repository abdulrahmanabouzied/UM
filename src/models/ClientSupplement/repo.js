import ClientSupplement from "./model.js";
import AppError from "../../utils/appError.js";

class ClientSupplementRepository {
  async list(filter) {
    try {
      const clientSupplements = await ClientSupplement.find(filter).lean();
      return {
        status: 200,
        success: true,
        data: clientSupplements,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const clientSupplement = await ClientSupplement.findOne(filter).lean();
      if (!clientSupplement) {
        return new AppError("NOT_FOUND", "ClientSupplement not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: clientSupplement,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(data) {
    try {
      const clientSupplement = new ClientSupplement(data);
      const savedClientSupplement = await clientSupplement.save();
      return {
        status: 201,
        success: true,
        data: savedClientSupplement,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(ClientSupplementId, newData) {
    try {
      const plan = await ClientSupplement.findById(ClientSupplementId);

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

  async delete(ClientSupplementId) {
    try {
      const deletedClientSupplement = await ClientSupplement.findByIdAndDelete(
        ClientSupplementId
      ).lean();
      if (!deletedClientSupplement) {
        return new AppError("NOT_FOUND", "ClientSupplement not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedClientSupplement,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const ClientSupplements = await ClientSupplement.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return {
        status: 200,
        success: true,
        data: ClientSupplements,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ClientSupplementRepository;
