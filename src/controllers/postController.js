import BaseController from './baseController.js';
import Post from '../models/postModel.js';
import { deleteImage } from '../config/cloudinary.js';

export default class PostController extends BaseController {
  constructor() {
    super(Post);
  }

  createPost = async (req, res, next) => {
    try {
      const { title, subtitle, content, author } = req.body;
      const imageUrl = req.file ? req.file.path : null;
      const imagePublicId = req.file ? req.file.filename : null;
      const createdBy = req.loggedUserId;

      const newPost = await this.model.create({
        title,
        subtitle,
        content,
        imageUrl,
        imagePublicId,
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

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await this.model.findById(id);

      if (!post) {
        return res.status(404).json({ message: 'Postagem não encontrada' });
      }

      if (post.imagePublicId) {
        await deleteImage(post.imagePublicId);
      }

      await this.model.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Postagem e imagem excluidos com sucesso!' });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const post = await this.model.findById(id);

      if (!post) {
        return res.status(404).json({ message: 'Postagem não econtrada' });
      }

      const updateData = { ...req.body };

      if (req.file) {
        await deleteImage(post.imagePublicId);
        updateData.imageUrl = req.file.path;
        updateData.imagePublicId = req.file.filename;
      }


      const updateDoc = await this.model.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({ message: 'Postagem atualizada com sucesso!', updateDoc });
    } catch (error) {
      next(error);
    }
  };
}
