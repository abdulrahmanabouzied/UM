import ClientRepository from '../models/Clients/repo.js';
import AppError from '../utils/appError.js';

import Client from '../models/Clients/model.js';
import mongoose from 'mongoose';
import {
  uploadFile,
  removeFile,
  handleFiles,
} from '../middlewares/cloudinaryUploader.js';
import fs from 'fs';
import path from 'path';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// import ClientWorkout from "./../models/ClientWorkouts/model.js";

const clientRepository = new ClientRepository();

class ClientsController {
  // Client Data Routes
  async getMe(req, res, next) {
    const clientId = req.user.id;
    const { query } = req.query;
    const result = await clientRepository.getOne({ _id: clientId }, query);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getClient(req, res, next) {
    const clientId = req.params.id;
    const { query } = req.query;
    const result = await clientRepository.getOne({ _id: clientId }, query);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getClientCoach(req, res, next) {
    const clientId = req.params.id;
    const { query } = req.query;
    const result = await clientRepository
      .getOneCoach({ _id: clientId }, query)
      .populate('coach');
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getAllClients(req, res, next) {
    const result = await clientRepository.list();
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async getClientWorkoutPlan(req, res, next) {
    try {
      const { id } = req.params;
      const client = await Client.findById(id)
        .populate({
          path: 'WorkoutPlan',
          populate: {
            path: 'days.exercises.exercise',
          },
        })
        .select('WorkoutPlan');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      client.WorkoutPlan.checkState();
      client.WorkoutPlan.checkDays();
      await client.WorkoutPlan.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: client,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getClientDietPlan(req, res, next) {
    try {
      const { id } = req.params;

      let populateList = [
        'breakfast',
        'midMorning',
        'lunch',
        'eveningSnacks',
        'dinner',
      ];

      let fields = populateList.map((item) => ({
        path: 'NutritionPlan',
        populate: {
          path: `days.${item}.ingredients.item`,
        },
      }));

      const client = await Client.findById(id)
        .populate(fields)
        .select('NutritionPlan _id');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      await client.NutritionPlan.checkState();
      await client.NutritionPlan.save();

      res.status(200).json({
        success: true,
        status: 200,
        // plan: client.NutritionPlan._id,
        data: client,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getDietPlanDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order, date, query } = req.query;
      let day, plan;

      let populateList = [
        'breakfast',
        'midMorning',
        'lunch',
        'eveningSnacks',
        'dinner',
      ];

      let fields = populateList.map((item) => ({
        path: 'NutritionPlan',
        populate: {
          path: `days.${item}.ingredients.item`,
        },
      }));

      const client = await Client.findById(id)
        .populate(fields)
        .select('NutritionPlan');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      await client.NutritionPlan.checkState();
      await client.NutritionPlan.save();

      if (!client.NutritionPlan) {
        return next(new AppError('NOT_FOUND', 'Plan not found', 404));
      }

      if (!order && !date) {
        day = client.NutritionPlan.getDayByDate();
        if (query) {
          day = day[query]?.ingredients;
        }
        return res.status(200).json({
          success: true,
          status: 200,
          plan: client.NutritionPlan._id,
          data: day,
        });
      }

      if (date) {
        day = client.NutritionPlan.getDayByDate(date);
      } else {
        day = client.NutritionPlan.days.find((day, idx) => {
          console.log(order, idx);
          return idx === +order - 1 || +day?.order === +order;
        });
      }

      if (!day) {
        return next(new AppError('NOT_FOUND', 'Day not found', 404));
      }

      if (query) {
        day = day[query]?.ingredients;
      }

      res.status(200).json({
        success: true,
        status: 200,
        plan: client.NutritionPlan._id,
        data: day,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getSupplePlanDay(req, res, next) {
    try {
      const { id } = req.params;
      const { order, date, query } = req.query;
      let day, plan;

      let populateList = [
        'breakfast',
        'midMorning',
        'lunch',
        'eveningSnacks',
        'dinner',
      ];

      let fields = populateList.map((item) => ({
        path: 'SupplementPlan',
        populate: {
          path: `days.${item}.supplements.item`,
        },
      }));

      const client = await Client.findById(id)
        .populate(fields)
        .select('SupplementPlan');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      if (!client.SupplementPlan) {
        return next(new AppError('NOT_FOUND', 'Plan not found', 404));
      }

      await client.SupplementPlan.checkState();
      await client.SupplementPlan.save();

      if (!order && !date) {
        day = client.SupplementPlan.getDayByDate();
        if (query) {
          day = day[query]?.supplements;
        }
        return res.status(200).json({
          success: true,
          status: 200,
          plan: client.SupplementPlan._id,
          data: day,
        });
      }

      if (date) {
        day = client.SupplementPlan.getDayByDate(date);
      } else {
        day = client.SupplementPlan.days.find((day, idx) => {
          console.log(order, idx);
          return idx === +order - 1 || +day?.order === +order;
        });
      }

      if (query) {
        day = day[query]?.supplements;
      }
      res.status(200).json({
        success: true,
        status: 200,
        plan: client.SupplementPlan._id,
        data: day,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getSupplePlanDayItems(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;
      let day;

      let populateList = [
        'breakfast',
        'midMorning',
        'lunch',
        'eveningSnacks',
        'dinner',
      ];

      let fields = populateList.map((item) => ({
        path: 'SupplementPlan',
        populate: {
          path: `days.${item}.supplements.item`,
        },
      }));

      const formatDay = (day, populateList) => {
        if (!day) next(new AppError('NOT_FOUND', 'Day not found', 400));
        return populateList.map((list) => {
          let result = {
            meal: list,
            time: day[list]?.time,
            items: day[list]?.supplements,
          };

          return result;
        });
      };

      const client = await Client.findById(id)
        .populate(fields)
        .select('SupplementPlan');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      if (!client.SupplementPlan) {
        return next(new AppError('NOT_FOUND', 'Plan not found', 404));
      }

      if (!date) {
        day = client.SupplementPlan.getDayByDate();
        // day = formatDay(day, populateList);

        return res.status(200).json({
          success: true,
          status: 200,
          plan: client.SupplementPlan._id,
          day: day._id,
          data: formatDay(day, populateList),
        });
      }


      await client.SupplementPlan.checkState();
      await client.SupplementPlan.save();

      day = client.SupplementPlan.getDayByDate(date);
      // day = formatDay(day, populateList);

      console.log(
        '🚀 ~ ClientsController ~ getSupplePlanDayItems ~ client:',
        day, date
      );

      res.status(200).json({
        success: true,
        status: 200,
        plan: client.SupplementPlan._id,
        day: day._id,
        data: formatDay(day, populateList),
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async getClientSupplementPlan(req, res, next) {
    try {
      const { id } = req.params;

      let populateList = [
        'breakfast',
        'midMorning',
        'lunch',
        'eveningSnacks',
        'dinner',
      ];

      let fields = populateList.map((item) => ({
        path: 'SupplementPlan',
        populate: {
          path: `days.${item}.supplements.item`,
        },
      }));

      const client = await Client.findById(id)
        .populate(fields)
        .select('SupplementPlan');

      if (!client) {
        return next(new AppError('NOT_FOUND', 'Client not found', 404));
      }

      await client.SupplementPlan.checkState();
      await client.SupplementPlan.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: client,
      });
    } catch (error) {
      return next(new AppError(error.name, error.message, 500));
    }
  }

  async deleteClient(req, res, next) {
    const clientId = req.params.id;
    const result = await clientRepository.delete(clientId);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateClient(req, res, next) {
    const { id } = req.params;
    let newData = req.body;
    let files = req.files;
    let uploadedData;

    const client = await Client.findById(id);

    if (!client) {
      return next(new AppError('NOT_FOUND', 'client not found', 404));
    }

    if (client?.coach) {
      await client.populate('coach');
    }

    if (files?.picture) {
      if (client?.picture) {
        const flushed = await removeFile('image', client?.picture.public_id);
        if (!flushed.success) {
          return next(flushed);
        }
      }
      uploadedData = await handleFiles(newData, files, 'Clients', 'picture');
      if (!uploadedData) {
        return next(uploadedData);
      }
    }

    if (files?.inbody) {
      if (client?.inbody?.public_id) {
        const flushed = await removeFile('raw', client?.inbody?.public_id);
        if (!flushed.success) {
          return next(flushed);
        }
      }
      uploadedData = await handleFiles(
        newData,
        files,
        'Clients',
        'inbody',
        'raw'
      );
      if (!uploadedData) {
        return next(uploadedData);
      }
      client.inbodyRequested = false;
    }

    if (client?.coach && newData?.inbody) {
      client.coach.notifications.push({
        title: 'inbody uploaded',
        message: `${client.fullname} uploaded an inbody.`,
        date: new Date(),
      });
      await client.coach.save();
    }

    await client.updateOne(newData);
    await client.save();

    res.status(200).json({
      success: true,
      status: 200
    });
  }

  async getInbody(req, res, next) {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return next(new AppError('NOT_FOUND', 'client not found', 404));
    }

    if (client?.inbody) {
      try {
        const filePath = client.inbody.path;

        // console.log(filePath);
        // console.log(path.join(__dirname, filePath));

        return res.sendFile(path.join(__dirname, '..', '..', filePath));
      } catch (error) {
        return next(new AppError(error.name, 'Error Finding file', 500));
      }
    }

    return next(new AppError('NOT_FOUND', 'inbody not found', 404));
  }

  async requestInbody(req, res, next) {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return next(new AppError('NOT_FOUND', 'coach not found', 404));
    }

    if (!client?.coach) {
      client.coach = req.user.id;
    }

    client.inbodyRequested = true;
    client.notifications.push({
      title: 'inbody request',
      message: `your coach has requested an inbody.`,
      date: new Date(),
    });
    await client.save();
    res.status(200).json({
      success: true,
      status: 200,
      data: 'inbody requested successfully',
    });
  }

  // Notifications API
  async getNotifications(req, res, next) {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return next(new AppError('NOT_FOUND', 'coach not found', 404));
    }

    await client.updateOne(
      {
        $set: {
          'notifications.$[].seen': true,
        },
      },
      {
        new: true,
      }
    );
    await client.save();

    res.status(200).json({
      success: true,
      status: 200,
      data: client.notifications,
    });
  }

  async deleteNotifications(req, res, next) {
    try {
      const { id } = req.params;
      const { id: noteId, order } = req.query;

      const client = await Client.findById(id);

      if (!client) {
        return next(new AppError('NOT_FOUND', 'coach not found', 404));
      }

      if (!noteId && !order) {
        return next(
          new AppError('NOT_FOUND', 'noteId or order not found', 404)
        );
      }

      if (order && client.notifications?.length >= +order) {
        client.notifications = client.notifications.splice(+order - 1, 1);
      } else {
        await client.updateOne(
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
        // client = await Client.updateOne(        );
      }

      await client.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: 'deleted successfully!',
      });
    } catch (error) {
      return next(new AppError(error.name, error, 500));
    }
  }

  async deleteAllNotifications(req, res, next) {
    try {
      const { id } = req.params;

      const client = await Client.findByIdAndUpdate(id, {
        $unset: {
          notifications: null,
        },
      });

      if (!client) {
        return next(new AppError('NOT_FOUND', 'coach not found', 404));
      }

      res.status(200).json({
        success: true,
        status: 200,
        data: 'Notifications deleted successfully!',
      });
    } catch (error) {
      return next(new AppError(error.name, error, 500));
    }
  }

  async markSeen(req, res, next) {
    try {
      const { id } = req.params;
      const { id: noteId, order } = req.query;

      const client = await Client.findById(id);

      if (!client) {
        return next(new AppError('NOT_FOUND', 'coach not found', 404));
      }

      if (!noteId && !order) {
        return next(
          new AppError('NOT_FOUND', 'noteId or order not found', 404)
        );
      }

      if (order && client.notifications?.length >= +order) {
        client.notifications[order - 1].seen = true;
        // console.log(client.notifications[order - 1]);
      } else {
        await client.updateOne(
          {
            $set: {
              'notifications.$[elem].seen': true,
            },
          },
          {
            new: true,
            arrayFilters: [
              {
                'elem._id': mongoose.Types.ObjectId(noteId),
              },
            ],
          }
        );
      }

      await client.save();

      res.status(200).json({
        success: true,
        status: 200,
        data: 'seen successfully!',
      });
    } catch (err) {
      return next(new AppError(err.name, err.message, 500));
    }
  }

  async markAllSeen(req, res, next) {
    try {
      const { id } = req.params;

      const client = await Client.findByIdAndUpdate(
        id,
        {
          $set: {
            'notifications.$[].seen': true,
          },
        },
        {
          new: true,
        }
      );

      if (!client) {
        return next(new AppError('NOT_FOUND', 'coach not found', 404));
      }

      res.status(200).json({
        success: true,
        status: 200,
        data: 'all marked seen successfully.',
      });
    } catch (err) {
      return next(new AppError(err.name, err.message, 500));
    }
  }
}

export default new ClientsController();
