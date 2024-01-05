import AppError from "../../utils/AppError.js";
import Ingredient from "./model.js";

class IngredientRepository {
  async list(filter) {
    try {
      const ingredients = await Ingredient.find(filter).lean();
      return { status: 200, success: true, data: ingredients, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter) {
    try {
      const ingredient = await Ingredient.findOne(filter).lean();
      if (!ingredient) {
        return new AppError("NOT_FOUND", "ingredient not found", 404);
      }
      return { status: 200, success: true, data: ingredient, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(ingredientData) {
    try {
      const ingredient = new Ingredient(ingredientData);
      const savedIngredient = await ingredient.save();
      return { status: 201, success: true, data: savedIngredient, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(ingredientId, newData) {
    try {
      const updatedIngredient = await Ingredient.findByIdAndUpdate(
        ingredientId,
        newData,
        { new: true }
      ).lean();
      if (!updatedIngredient) {
        return new AppError("NOT_FOUND", "ingredient not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: updatedIngredient,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(ingredientId) {
    try {
      const deletedIngredient = await Ingredient.findByIdAndDelete(
        ingredientId
      ).lean();
      if (!deletedIngredient) {
        return new AppError("NOT_FOUND", "ingredient not found", 404);
      }
      return {
        status: 200,
        success: true,
        data: deletedIngredient,
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const ingredients = await Ingredient.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: ingredients, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default IngredientRepository;
