// clientRepository.js
import Client from "./model.js";
import AppError from "../../utils/appError.js";
class ClientRepository {
  async list() {
    try {
      const clients = await Client.find().lean();
      return { status: 200, success: true, data: clients, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async getOne(filter, query) {
    try {
      const client = await Client.findOne(filter);

      if (!client) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      if (query) {
        return {
          status: 200,
          success: true,
          data: client.toObject()[query],
          error: null,
        };
      }
      return {
        status: 200,
        success: true,
        data: client.toObject(),
        error: null,
      };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async create(clientData) {
    try {
      const client = new Client(clientData);
      const savedClient = await client.save();
      return { status: 201, success: true, data: savedClient, error: null };
    } catch (error) {
      // throw new appError(error.name, 500, error.message, false);
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async update(clientId, newData) {
    try {
      const updatedClient = await Client.findByIdAndUpdate(clientId, newData, {
        new: true,
      }).lean();
      if (!updatedClient) {
        return {
          status: 404,
          success: false,
          data: null,
          error: "Client not found",
          name: "USER_NOT_FOUND",
        };
      }
      return { status: 200, success: true, data: updatedClient, error: null };
    } catch (error) {
      return {
        name: error.name,
        status: 500,
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  async delete(clientId) {
    try {
      const deletedClient = await Client.findByIdAndDelete(clientId).lean();
      if (!deletedClient) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      return { status: 200, success: true, data: deletedClient, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async listPaginated(page, limit) {
    try {
      const clients = await Client.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      return { status: 200, success: true, data: clients, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async notifyClient(id, note) {
    try {
      const client = await Client.findById(id);
      if (!client) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      client.notifications.push(note);
      await client.save();
      return { status: 200, success: true, data: client, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }

  async markRead(id) {
    try {
      const client = await Client.findById(id);
      if (!client) {
        return new AppError("NOT_FOUND", "Client not found", 404);
      }
      client.notifications = client.notifications.map(
        (note) => (note.seen = true)
      );
      await client.save();
      return { status: 200, success: true, data: client, error: null };
    } catch (error) {
      return new AppError(error.name, error.message, 500, false, error.stack);
    }
  }
}

export default ClientRepository;
