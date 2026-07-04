import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default class UserController {
  cadUser = async (req, res) => {
    try {
      const { name, pass } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(pass, salt);

      const newUser = await User.create({
        name,
        passHash: hashPass
      });

      return res.status(201).json({
        message: 'Usuário criado com sucesso!',
        id: newUser._id
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };

  userLogin = async (req, res) => {
    try {
      const { name, pass } = req.body;
      const userFound = await User.findOne({ name }).select('+passHash');

      if (!userFound) {
        return res.status(401).json({ message: 'Credenciais inválidas!' });
      }

      const passCompare = await bcrypt.compare(pass, userFound.passHash);
      if (!passCompare) {
        return res.status(401).json({ message: 'Credenciais inválidas!' });
      }

      const token = jwt.sign(
        { id: userFound._id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(200).json({ message: 'Login realizando com sucesso!', token });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  };
};
