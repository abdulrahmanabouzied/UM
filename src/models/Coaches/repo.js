import AppError from "../../utils/appError.js";
import Coach from "./model.js";

class CoachRepository {
  async list(filter) {
    try {
      const coaches = await Coach.find(filter).lean();
      return { status: 200, success: true, data: coaches, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const coach = await Coach.findOne(filter).lean();
      if (!coach) {
        return new AppError("NOT_FOUND", "Coach not found", 404);
      }
      return { status: 200, success: true, data: coach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getById(id) {
    try {
      const coach = await Coach.findById(id).lean();
      if (!coach) {
        return new AppError("NOT_FOUND", "Coach not found", 404);
      }
      return { status: 200, success: true, data: coach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(coachData) {
    try {
      const coach = new Coach(coachData);
      const savedCoach = await coach.save();
      return { status: 201, success: true, data: savedCoach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(coachId, newData) {
    try {
      const updatedCoach = await Coach.findByIdAndUpdate(coachId, newData, {
        new: true,
      }).lean();
      if (!updatedCoach) {
        return new AppError("NOT_FOUND", "Coach not found", 404);
      }
      return { status: 200, success: true, data: updatedCoach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(coachId) {
    try {
      const deletedCoach = await Coach.findByIdAndDelete(coachId).lean();
      if (!deletedCoach) {
        return new AppError("NOT_FOUND", "Coach not found", 404);
      }
      return { status: 200, success: true, data: deletedCoach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const coaches = await Coach.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: coaches, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async notifyClient(id, note) {
    try {
      const coach = await Coach.findById(id);
      if (!coach) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      coach.notifications.push(note);
      await coach.save();
      return { status: 200, success: true, data: coach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async markRead(id) {
    try {
      const coach = await Coach.findById(id);
      if (!coach) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      coach.notifications = coach.notifications.map(
        (note) => (note.seen = true)
      );
      await coach.save();
      return { status: 200, success: true, data: coach, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default CoachRepository;
