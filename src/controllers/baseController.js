export default class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Busca todos os registros
  getAll = async (req, res, next) => {
    try {
      const docs = await this.model.find();
      return res.status(200).json(docs);
    } catch (error) {
      next(error);
    }
  };

  // Buscar registros por id
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const doc = await this.model.findById(id);

      if (!doc) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  };

  // Busca registro por parâmetro
  getByParams = async (req, res, next) => {
    try {
      const params = req.query;
      const doc = await this.model.findOne(params);

      if (!doc) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  };

  // Atualziar registro
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const newValues = req.body;

      const updatedDoc = await this.model.findByIdAndUpdate(id, newValues, {
        new: true,
        runValidator: true
      });

      if (!updatedDoc) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json({
        message: 'Registro atualizado com sucesso!',
        updatedDoc
      });
    } catch (error) {
      next(error);
    }
  };

  // Deletar registro
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedDoc = await this.model.findByIdAndDelete(id);

      if (!deletedDoc) {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }

      return res.status(200).json({ message: 'Registro removido com sucesso!' });
    } catch (error) {
      next(error);
    }
  };
};
