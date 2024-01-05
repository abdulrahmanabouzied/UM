import IngredientRepository from "../models/Ingredients/repo.js";
const ingredientRepository = new IngredientRepository();

class IngredientsController {
  async getAllItems(req, res, next) {
    const result = await ingredientRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getItem(req, res, next) {
    const { id } = req.params;

    const result = await ingredientRepository.getOne({ _id: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getCoachItems(req, res, next) {
    const { id } = req.params;
    const result = await ingredientRepository.list({ coach: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async createItem(req, res, next) {
    const ingredientData = req.body;
    const result = await ingredientRepository.create(ingredientData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateItem(req, res, next) {
    const ingredientId = req.params.id;
    const newData = req.body;
    const result = await ingredientRepository.update(ingredientId, newData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async deleteItem(req, res, next) {
    const ingredientId = req.params.id;
    const result = await ingredientRepository.delete(ingredientId);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }
}

export default new IngredientsController();
