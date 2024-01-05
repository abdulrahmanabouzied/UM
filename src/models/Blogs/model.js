import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    coach: {
      type: mongoose.Schema.ObjectId,
      ref: "Coaches",
      required: [true, "Coach Id required"],
    },
    details: {
      type: String,
      required: true,
    },
    coverImage: {
      type: Object,
      // required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blogs", blogSchema);

export default Blog;
