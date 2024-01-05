import BlogRepository from "../models/Blogs/repo.js";
import { uploadFile, removeFile } from "../middlewares/cloudinaryUploader.js";
import Blog from "../models/Blogs/model.js";
import AppError from "../utils/AppError.js";

const blogRepository = new BlogRepository();
class BlogsController {
  async getAllItems(req, res, next) {
    const result = await blogRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getCoachBlogs(req, res, next) {
    const { coach } = req.params;
    const result = await blogRepository.list({ coach });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async createItem(req, res, next) {
    const blogData = req.body;
    const { coverImage } = req.files;

    if (coverImage?.length) {
      const done = await uploadFile(coverImage[0].path, "blogs");

      if (done.success) {
        blogData.coverImage = done.data;
      } else {
        return next(done);
      }
    }

    const result = await blogRepository.create(blogData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateItem(req, res, next) {
    const blogId = req.params.id;
    const newData = req.body;
    const { coverImage } = req.files;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return next(new AppError("BLOG_NOT_FOUND", `${blogId} not found`, 404));
    }

    if (blog.coverImage) {
      const done = await removeFile("image", blog?.coverImage.public_id);

      if (!done.success) {
        return next(done);
      }
    }

    if (coverImage?.length) {
      const done = await uploadFile(coverImage[0].path, "blogs");

      if (done.success) {
        newData.coverImage = done.data;
      } else {
        return next(done);
      }
    }

    /*
    Object.keys(newData).forEach((key) => {
      blog[key] = newData[key];
    });*/

    await blog.updateOne(newData);
    await blog.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: blog.toObject(),
    });
  }

  async deleteItem(req, res, next) {
    const { id } = req.params;
    console.log(id);
    const result = await Blog.findByIdAndDelete(id);

    if (result) {
      const file = result?.coverImage;

      if (file) {
        const result = await removeFile("image", file.public_id);

        if (!result.success) {
          return next(result);
        }
      }
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: result,
    });
  }

  async deleteItems(req, res, next) {
    let { blogs } = req.body;

    if (!blogs?.length) {
      return next(new AppError("BLOG_IDS_FOUND", "Blogs not found", 401));
    }

    let db_blogs = await Blog.find({
      _id: {
        $in: blogs,
      },
    });

    let public_ids = [];

    db_blogs.forEach((blog) => {
      if (blog?.coverImage) public_ids.push(blog.coverImage.public_id);
    });

    console.log(public_ids);

    const cloudRemoved = await removeFile("image", ...public_ids);

    if (!cloudRemoved.success) {
      return next(cloudRemoved);
    }

    const result = await Blog.deleteMany({
      _id: {
        $in: blogs,
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      data: result,
    });
  }

  async getItem(req, res, next) {
    const { id } = req.params;
    const result = await blogRepository.getOne({ _id: id });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }
}

export default new BlogsController();
