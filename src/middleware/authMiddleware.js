import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const validToken = jwt.verify(token, process.env.JWT_SECRET);

    req.loggedUserId = validToken.id;

    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

export const validationId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID com formato inválido' });
  }

  next();
};

export const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login a partir deste IP, tente novamente após 15 minutos.'
});
