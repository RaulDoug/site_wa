import mongoose from 'mongoose';
import app from './app.js';

const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT || 3000;

async function main() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Conectado ao MongoDB com sucesso!');
    app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
  } catch (error) {
    console.error('Erro ao iniciar o sevidor:', error);
  }

}

main();


