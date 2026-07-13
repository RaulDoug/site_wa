import BaseController from './baseController.js';
import Event from '../models/eventModel.js';
import { deleteImage } from '../config/cloudinary.js';

export default class EventController extends BaseController {
  constructor() {
    super(Event);
  }

  createEvent = async (req, res, next) => {
    try {
      const { title, desc, eventLoc, eventDate, whatsappLink } = req.body;
      const imageUrl = req.file ? req.file.path : null;
      const imagePublicId = req.file ? req.file.filename : null;
      const createdBy = req.loggedUserId;

      const newEvent = await this.model.create({
        title,
        desc,
        imageUrl,
        imagePublicId,
        eventLoc,
        whatsappLink,
        eventDate,
        createdBy
      });

      return res.status(200).json({
        message: 'Evento criado com sucesso!',
        newEvent
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const event = await this.model.findById(id);

      if (!event) {
        return res.status(404).json({ message: 'Evento não encontrado' });
      }

      if (event.imagePublicId) {
        await deleteImage(event.imagePublicId);
      }

      await this.model.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Evento e imagem excluidos com sucesso!' });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const event = await this.model.findById(id);

      if (!event) {
        return res.status(404).json({ message: 'Evento não econtrado' });
      }

      const updateData = { ...req.body };

      if (req.file) {
        await deleteImage(event.imagePublicId);
        updateData.imageUrl = req.file.path;
        updateData.imagePublicId = req.file.filename;
      }


      const updateDoc = await this.model.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({ message: 'Evento atualizado com sucesso!', updateDoc });
    } catch (error) {
      next(error);
    }
  };
}
