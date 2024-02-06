import Client from "../models/Clients/model.js";
import Coach from "../models/Coaches/model.js";
import AppError from "./appError.js";

/**
 * Notifications
 * @description manipulating notifications array for coahes and users
 */
class Notifications {
  constructor(model) {
    this.model = model;
  }

  /**
   * notify
   * @param {String} userId
   * @param {Object} note
   * @returns error or reponse
   */
  async notify(userId, note) {
    const user = await model.findByIdAndUpdate(userId, {
      $push: {
        notifications: note,
      },
    });

    if (!user) {
      return new AppError("NOT_FOUND", "user not found", 404);
    }

    return {
      success: true,
      status: 200,
      data: "notification sent successfully",
    };
  }

  /**
   * notifyCoach
   * @param {Object} note
   * @returns error or reponse
   */
  async notifyCoach(note) {
    const coach = (await Coach.find({})).at(0);

    coach.updateOne({
      $push: {
        notifications: note,
      },
    });
    await coach.save();

    if (!coach) {
      return new AppError("NOT_FOUND", "user not found", 404);
    }

    return {
      success: true,
      status: 200,
      data: "notification sent successfully",
    };
  }

  /**
   * getNotification
   * @param {String} id the id of the user
   * @returns error or response
   */
  async getAll(userId) {
    const user = await this.model.findById(userId);

    if (!user) {
      return new AppError("NOT_FOUND", "user not found", 404);
    }

    if (user instanceof Client) {
      await user.updateOne(
        {
          $set: {
            "notifications.$[].seen": true,
          },
        },
        {
          new: true,
        }
      );
      await user.save();
    }

    return {
      success: true,
      status: 200,
      data: user.notifications,
    };
  }

  /**
   * deleteOne
   * @param {String} userId
   * @param {String} noteId
   * @param {Number} noteOrder
   * @returns error or respose
   */
  async deleteOne(userId, noteId, noteOrder) {
    try {
      const user = await this.model.findById(userId);

      if (!user) {
        return new AppError("NOT_FOUND", "user not found", 404);
      }

      if (!noteId && !noteOrder) {
        return new AppError("NOT_FOUND", "noteId or order not found", 404);
      }

      if (order && user.notifications?.length >= +order) {
        user.notifications = user.notifications.splice(+order - 1, 1);
      } else {
        await user.updateOne(
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

      await user.save();

      return {
        success: true,
        status: 200,
        data: "deleted successfully!",
      };
    } catch (error) {
      return new AppError(error.name, error, 500);
    }
  }

  /**
   * notifyClient
   * @param {String|Array} clientsId client id to sent note
   * @param {Object} note the notification body specefied in the schema
   * @returns error or response
   */
  async notifyClient(clientsId, note) {
    try {
      if (!Array.isArray(clientsId)) {
        await Client.findByIdAndUpdate(clientsId, {
          $push: {
            notifications: note,
          },
        });
      } else {
        await Client.updateMany(
          {
            _id: {
              $in: clientsId,
            },
          },
          {
            $addToSet: {
              notifications: note,
            },
          }
        );
      }

      return {
        success: true,
        status: 200,
        data: "notification sent successfully",
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500);
    }
  }

  /**
   * notifyAllClients
   * @param {Object} note the notification body specefied in the schema
   * @returns error or reponse
   */
  async notifyAllClients(note) {
    try {
      await Client.updateMany(
        {},
        {
          $push: {
            notifications: note,
          },
        }
      );

      return {
        success: true,
        status: 200,
        data: "notification sent successfully",
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500);
    }
  }

  /**
   * markSeen
   * @param {String} userId
   * @param {String} noteId
   * @param {Number} noteOrder
   * @returns error or reponse
   */
  async markSeen(userId, noteId, noteOrder) {
    try {
      const user = await this.model.findById(userId);

      if (!user) {
        return next(new AppError("NOT_FOUND", "user not found", 404));
      }

      if (!noteId && !noteOrder) {
        return next(
          new AppError("NOT_FOUND", "noteId or order not found", 404)
        );
      }

      if (order && user.notifications?.length >= +order) {
        user.notifications[+order - 1].seen = true;
      } else {
        await user.updateOne(
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
      await user.save();

      return {
        success: true,
        status: 200,
        data: "seen successfully!",
      };
    } catch (err) {
      return new AppError(err.name, err.message, 500);
    }
  }

  /**
   * markAllSeen
   * @param {*} userId to whom all marked seen
   * @returns error or repsonse
   */
  async markAllSeen(userId) {
    try {
      const user = await this.model.findByIdAndUpdate(
        userId,
        {
          $set: {
            "notifications.$[].seen": true,
          },
        },
        {
          new: true,
        }
      );

      if (!user) {
        return next(new AppError("NOT_FOUND", "coach not found", 404));
      }

      return {
        success: true,
        status: 200,
        data: "all marked seen successfully.",
      };
    } catch (err) {
      return new AppError(err.name, err.message, 500);
    }
  }
}

export default Notifications;
