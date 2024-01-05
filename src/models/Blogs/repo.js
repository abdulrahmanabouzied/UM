import Blog from "./model.js";
import AppError from "../../utils/AppError.js";
class BlogRepository {
  async list(filter) {
    try {
      const blogs = await Blog.find(filter).lean();
      return { status: 200, success: true, data: blogs, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(field) {
    try {
      const blog = await Blog.findOne(field).lean();
      if (!blog) {
        return new AppError(
          "BLOG_NOT_FOUND",
          "not found blog with id: " + arguments["0"],
          404
        );
      }
      return { status: 200, success: true, data: blog, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(blogData) {
    try {
      const savedBlog = await Blog.create(blogData);
      return { status: 201, success: true, data: savedBlog, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(blogId, newData) {
    try {
      const updatedBlog = await Blog.findByIdAndUpdate(blogId, newData, {
        new: true,
      });
      if (!updatedBlog) {
        return new AppError(
          "BLOG_NOT_FOUND",
          "not found blog with id: " + blogId,
          404
        );
      }
      return { status: 200, success: true, data: updatedBlog, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async delete(blogId) {
    try {
      const deletedBlog = await Blog.findByIdAndDelete(blogId);
      if (!deletedBlog) {
        return {
          status: 404,
          success: false,
          data: null,
          error: "Blog not found",
        };
      }
      return { status: 200, success: true, data: deletedBlog, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const blogs = await Blog.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: blogs, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default BlogRepository;
