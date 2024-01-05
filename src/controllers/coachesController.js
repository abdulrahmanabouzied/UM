import {
  uploadFile,
  removeFile,
  handleFiles,
} from "../middlewares/cloudinaryUploader.js";
import Coach from "../models/Coaches/model.js";
import CoachRepository from "../models/Coaches/repo.js";
import AppError from "../utils/appError.js";

import Client from "./../models/Clients/model.js";

const coachRepository = new CoachRepository();

class CoachesController {
  async getCoach(req, res, next) {
    const coachId = req.params.id;
    const result = await coachRepository.getOne({ _id: coachId });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateCoach(req, res, next) {
    const { id } = req.params;
    const newData = req.body;
    const files = req.files;
    let uploadedData;

    const coach = await Coach.findById(id);

    if (!coach) {
      return next(new AppError("NOT_FOUND", "coach not found", 404));
    }

    if (files?.picture) {
      if (coach?.picture) {
        const flushed = await removeFile("image", coach?.picture.public_id);
        if (!flushed.success) {
          return next(flushed);
        }
      }
      uploadedData = await handleFiles(newData, files, "Coaches", "picture");
      if (!uploadedData) {
        return next(uploadedData);
      }
    }

    if (files?.bannerImage) {
      if (coach?.bannerImage) {
        const flushed = await removeFile("image", coach.bannerImage?.public_id);
        if (!flushed.success) {
          return next(flushed);
        }
      }
      uploadedData = await handleFiles(
        newData,
        files,
        "Coaches",
        "bannerImage"
      );
      if (!uploadedData) {
        return next(uploadedData);
      }
    }

    await coach.updateOne(newData);
    await coach.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: coach,
    });
  }

  async deleteCoach(req, res, next) {
    const { id } = req.params;

    const coach = await Coach.findById(id);

    if (!coach) {
      return next(new AppError("NOT_FOUND", "coach not found", 404));
    }

    if (coach?.picture) {
      const flushed = await removeFile("image", coach?.picture.public_id);
      if (!flushed.success) {
        return next(flushed);
      }
    }

    if (coach?.bannerImage) {
      const flushed = await removeFile("image", coach.bannerImage?.public_id);
      if (!flushed.success) {
        return next(flushed);
      }
    }

    await coach.deleteOne();

    res.status(200).json({
      success: true,
      status: 200,
      data: coach,
    });
  }

  async getAllClients(req, res, next) {
    const { id } = req.params;

    const coach = await Coach.findById(id).populate("clients");

    if (!coach) {
      return next(new AppError("NOT_FOUND", "coach not found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: coach.clients,
    });
  }

  async getAllBlogs(req, res, next) {
    const { id } = req.params;

    const coach = await Coach.findById(id).populate("blogs");

    if (!coach) {
      return next(new AppError("NOT_FOUND", "coach not found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: coach.blogs,
    });
  }

  // Notifications API
  async getNotifications(req, res, next) {
    const { id } = req.params;

    const coach = await Coach.findById(id);

    if (!coach) {
      return next(new AppError("NOT_FOUND", "coach not found", 404));
    }

    res.status(200).json({
      success: true,
      status: 200,
      data: coach.notifications,
    });
  }

  async deleteNotifications(req, res, next) {
    try {
      const { id } = req.params;
      const { id: noteId, order } = req.query;

      const coach = await Coach.findById(id);

      if (!coach) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }

      if (!noteId && !order) {
        return next(
          new AppError("NOT_FOUND", "noteId or order not found", 404)
        );
      }

      if (order && coach.notifications?.length >= +order) {
        coach.notifications = coach.notifications.splice(+order - 1, 1);
      } else {
        await Coach.updateOne(
          {
            $pull: {
              notifications: {
                _id: noteId,
              },
            },
          },
          {
            new: true,
          }
        );
      }

      await coach.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: "deleted successfully!",
      });
    } catch (error) {
      return next(new AppError(error.name, error, 500));
    }
  }

  async markSeen(req, res, next) {
    try {
      const { id } = req.params;
      const { id: noteId, order } = req.query;

      const coach = await Coach.findById(id);

      if (!coach) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }

      if (!noteId && !order) {
        return next(
          new AppError("NOT_FOUND", "noteId or order not found", 404)
        );
      }

      if (order && coach.notifications?.length >= +order) {
        coach.notifications[order - 1].seen = true;
        console.log(coach.notifications[order - 1]);
      } else {
        coach = await Coach.updateOne(
          {
            $set: {
              "notifications.$[elem].seen": true,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                "elem._id": mongoose.Types.ObjectId(noteId),
              },
            ],
          }
        );
      }

      await coach.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: "seen successfully!",
      });
    } catch (err) {
      return next(new AppError(err.name, err.message, 500));
    }
  }

  async markAllSeen(req, res, next) {
    try {
      const { id } = req.params;

      const coach = await Coach.findByIdAndUpdate(
        id,
        {
          $set: {
            "notifications.$[].seen": true,
          },
        },
        {
          new: true,
        }
      );

      if (!coach) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }

      res.status(200).json({
        success: true,
        status: 200,
        data: "all marked seen successfully.",
      });
    } catch (err) {
      return next(new AppError(err.name, err.message, 500));
    }
  }

  async sendNotificationToClient(req, res, next) {
    try {
      const { id } = req.params;
      const { clients, notification } = req.body;

      const coach = await Coach.findById(id);

      if (!coach) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }

      const client = await Client.updateMany(
        {
          _id: {
            $in: clients,
          },
        },
        {
          $addToSet: {
            notifications: notification,
          },
        }
      );

      res.status(200).json({
        success: true,
        status: 200,
        data: "notification sent successfully",
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  /*
  async getFields(req, res, next) {
    try {
      const { id } = req.params;
      const { fileds } = req.body;
      
      const coach = await Coach.findById(id);

      if (!coach) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }



    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }*/
}

export default new CoachesController();
