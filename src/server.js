import mongoose from 'mongoose';
import app from './app.js';

const mongoUrl = process.env.NODE_ENV === 'test' ? process.env.MONGO_URL_TEST : process.env.MONGO_URL;
const port = process.env.PORT || 3000;

process.on('unhandledRejection', (reason) => {
  console.error('Rejeição não tratada detectada', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada detectada:', error);
  process.exit(1);
});

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


