import ClientAuditRepository from "../models/ClientAudits/repo.js";
const clientAuditRepository = new ClientAuditRepository();

class ClientAuditsController {
  async getAudits(req, res, next) {
    const clientId = req.params.clientId;
    const result = await clientAuditRepository.getOne({
      client: clientId,
    });
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async createNewAudits(req, res, next) {
    const auditData = req.body;
    const result = await clientAuditRepository.create(auditData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async updateAudits(req, res, next) {
    const auditId = req.params.id;
    const newData = req.body;
    const result = await clientAuditRepository.update(auditId, newData);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }

  async deleteAudits(req, res, next) {
    const auditId = req.params.id;
    const result = await clientAuditRepository.delete(auditId);
    if (!result.success) {
      return next(result);
    }
    res.status(result.status).json(result);
  }
}

export default new ClientAuditsController();
