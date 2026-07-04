import BaseController from './baseController.js';
import Post from '../models/postModel.js';

export default class PostController extends BaseController {
  constructor() {
    super(Post);
  }

  createPost = async (req, res, next) => {
    try {
      const { title, subtitle, content, imageUrl, author } = req.body;

      const createdBy = req.loggedUserId;

      const newPost = await this.model.create({
        title,
        subtitle,
        content,
        imageUrl,
        author,
        createdBy
      });

      return res.status(200).json({
        message: 'Novo post criado com sucesso!',
        newPost
      });
    } catch (error) {
      next(error);
    }
  };
}
