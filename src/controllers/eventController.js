import BaseController from './baseController.js';
import Event from '../models/eventModel.js';

export default class EventController extends BaseController {
  constructor() {
    super(Event);
  }

  createEvent = async (req, res, next) => {
    try {
      const { title, desc, imageUrl, eventLoc, eventDate } = req.body;
      const createdBy = req.loggedUserId;

      const newEvent = await this.model.create({
        title,
        desc,
        imageUrl,
        eventLoc,
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
}
