import SupplementRepository from "../models/Supplements/repo.js";
const supplementRepository = new SupplementRepository();

class SupplementsController {
  async getAllItems(req, res, next) {
    const result = await supplementRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getItem(req, res, next) {
    const { id } = req.params;

    const result = await SupplementRepository.getOne({ _id: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getCoachItems(req, res, next) {
    const { id } = req.params;
    const result = await supplementRepository.list({ coach: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async createItem(req, res, next) {
    const supplementData = req.body;
    const result = await supplementRepository.create(supplementData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateItem(req, res, next) {
    const supplementId = req.params.id;
    const newData = req.body;
    const result = await supplementRepository.update(supplementId, newData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async deleteItem(req, res, next) {
    const supplementId = req.params.id;
    const result = await supplementRepository.delete(supplementId);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }
}

export default new SupplementsController();
