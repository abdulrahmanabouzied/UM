import AppError from "../../utils/appError.js";
import ClientAudit from "./model.js";

class ClientAuditRepository {
  async list() {
    try {
      const clientAudits = await ClientAudit.find().lean();
      return { status: 200, success: true, data: clientAudits, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const clientAudit = await ClientAudit.findOne(filter).lean();
      if (!clientAudit) {
        return new AppError("NOT_FOUND", "ClientAudit not found", 404);
      }
      return { status: 200, success: true, data: clientAudit, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(clientAuditData) {
    try {
      const clientAudit = new ClientAudit(clientAuditData);
      const savedClientAudit = await clientAudit.save();
      return {
        status: 201,
        success: true,
        data: savedClientAudit,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(clientAuditId, newData) {
    try {
      const updatedClientAudit = await ClientAudit.findByIdAndUpdate(
        clientAuditId,
        newData,
        { new: true }
      ).lean();
      if (!updatedClientAudit) {
        return new AppError("NOT_FOUND", "ClientAudit not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: updatedClientAudit,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(clientAuditId) {
    try {
      const deletedClientAudit = await ClientAudit.findByIdAndDelete(
        clientAuditId
      ).lean();
      if (!deletedClientAudit) {
        return new AppError("NOT_FOUND", "ClientAudit not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedClientAudit,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const clientAudits = await ClientAudit.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: clientAudits, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ClientAuditRepository;
