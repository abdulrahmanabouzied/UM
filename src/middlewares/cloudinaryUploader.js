import { v2 as cloudinary } from "cloudinary";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));
import AppError from "../utils/appError.js";
import { config } from "dotenv";
config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadFile = async (file, folder) => {
  try {
    const {
      public_id,
      format,
      resource_type,
      created_at,
      bytes,
      type,
      url,
      secure_url,
    } = await cloudinary.uploader.upload(file, {
      use_filename: true,
      resource_type: "auto",
      folder,
    });
    console.log(public_id);

    console.log(public_id, resource_type, url);
    if (public_id) {
      fs.unlinkSync(file);
    }
    return {
      success: true,
      status: 200,
      data: {
        public_id,
        format,
        resource_type,
        created_at,
        bytes,
        type,
        url,
        secure_url,
        folder,
      },
    };
  } catch (error) {
    return new AppError(error.name, error, 500, false, error.stack);
  }
};

export const removeFile = async (rtype = "auto", ...public_ids) => {
  try {
    const result = await cloudinary.api.delete_resources(public_ids, {
      type: "upload",
      resource_type: rtype,
    });

    console.log(result);
    return {
      success: true,
      code: 200,
      data: result,
    };
  } catch (error) {
    return new AppError(error.name, error, 500, false, error.stack);
  }
};

export const handleFiles = async (target, files, folder, field) => {
  if (files[field]?.length) {
    const done = await uploadFile(files[field][0].path, folder);
    target[field] = done.data;
    return done;
  }
};
