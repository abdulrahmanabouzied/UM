import Supplement from "./model.js";
import AppError from "../../utils/appError.js"

class SupplementRepository {
  async list(filter) {
    try {
      const supplements = await Supplement.find(filter).lean();
      return { status: 200, success: true, data: supplements, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const supplement = await Supplement.findOne(filter).lean();
      if (!supplement) {
        return new AppError("NOT_FOUND", "Supplement not found", 404);
      }
      return { status: 200, success: true, data: supplement, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(supplementData) {
    try {
      const supplement = new Supplement(supplementData);
      const savedSupplement = await supplement.save();
      return { status: 201, success: true, data: savedSupplement, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(supplementId, newData) {
    try {
      const updatedSupplement = await Supplement.findByIdAndUpdate(
        supplementId,
        newData,
        { new: true }
      ).lean();
      if (!updatedSupplement) {
        return new AppError("NOT_FOUND", "Supplement not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: updatedSupplement,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(supplementId) {
    try {
      const deletedSupplement = await Supplement.findByIdAndDelete(
        supplementId
      ).lean();
      if (!deletedSupplement) {
        return new AppError("NOT_FOUND", "Supplement not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedSupplement,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const supplements = await Supplement.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: supplements, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default SupplementRepository;
