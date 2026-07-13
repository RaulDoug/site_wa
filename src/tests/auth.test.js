import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import User from '../models/userModel.js';

describe('Testes da API de Autenticação (Auth)', () => {
  const testUserCredentials = {
    name: 'auth_test_user',
    pass: 'password123'
  };

  beforeAll(async () => {
    // Carrega o .env manualmente se necessário
    if (!process.env.MONGO_URL_TEST) {
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envConfig = fs.readFileSync(envPath, 'utf-8');
          envConfig.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
              const [key, ...valueParts] = trimmedLine.split('=');
              if (key) {
                process.env[key.trim()] = valueParts.join('=').trim();
              }
            }
          });
        }
      } catch (err) {
        console.warn('Erro ao carregar o arquivo .env manualmente:', err);
      }
    }

    const mongoUrl = process.env.MONGO_URL_TEST;
    if (!mongoose.connection.readyState) {
      await mongoose.connect(mongoUrl);
    }

    // Cria o usuário de teste de forma limpa
    await User.deleteMany({ name: testUserCredentials.name });
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(testUserCredentials.pass, salt);
    await User.create({
      name: testUserCredentials.name,
      passHash: hashPass
    });
  });

  afterAll(async () => {
    // Limpa o usuário de teste
    await User.deleteMany({ name: testUserCredentials.name });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/login', () => {
    it('Deve retornar 200 e um token JWT com credenciais corretas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          name: testUserCredentials.name,
          pass: testUserCredentials.pass
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBeTypeOf('string');
    });

    it('Deve retornar 401 com credenciais incorretas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          name: testUserCredentials.name,
          pass: 'senha_incorreta'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('Teste do Rate Limit: Fazer 6 requisições de login consecutivas e verificar se a sexta retorna HTTP 429 (Too Many Requests)', async () => {
      // Fazemos 5 requisições consecutivas para estourar o limite (max: 5)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            name: testUserCredentials.name,
            pass: testUserCredentials.pass
          });
      }

      // A sexta requisição deve falhar com status 429
      const response6 = await request(app)
        .post('/api/auth/login')
        .send({
          name: testUserCredentials.name,
          pass: testUserCredentials.pass
        });

      expect(response6.status).toBe(429);
    });
  });
});
