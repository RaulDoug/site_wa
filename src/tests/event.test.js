import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

describe('Testes da API de Eventos', () => {
  let token;
  let testUser;

  // Conecta ao banco de dados antes de iniciar os testes
  beforeAll(async () => {
    // Carrega o .env manualmente se necessário
    if (!process.env.MONGO_URL) {
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

    const mongoUrl = process.env.MONGO_URL;
    if (!mongoose.connection.readyState) {
      await mongoose.connect(mongoUrl);
    }

    // Busca o usuário de teste existente 'Raul'
    testUser = await User.findOne({ name: 'Raul' });
    if (!testUser) {
      throw new Error("Usuário de teste 'Raul' não encontrado no banco de dados.");
    }

    // Gera um JWT válido para o usuário de teste usar nas rotas autenticadas
    token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  // Limpa a coleção de eventos antes de cada teste
  beforeEach(async () => {
    await Event.deleteMany({});
  });

  // Fecha a conexão do banco de dados
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/events', () => {
    it('deve retornar uma lista vazia quando não houver eventos', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('deve retornar todos os eventos existentes', async () => {
      await Event.create([
        { title: 'Evento 1', desc: 'Descrição 1', eventLoc: 'Local 1', eventDate: new Date(), createdBy: testUser._id },
        { title: 'Evento 2', desc: 'Descrição 2', eventLoc: 'Local 2', eventDate: new Date(), createdBy: testUser._id }
      ]);

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      const titles = response.body.map(event => event.title);
      expect(titles).toContain('Evento 1');
      expect(titles).toContain('Evento 2');
    });
  });

  describe('GET /api/events/search (Busca por parâmetros)', () => {
    it('deve filtrar os eventos baseado nos parâmetros de consulta (query params)', async () => {
      await Event.create([
        { title: 'Workshop JS', desc: 'Descrição 1', eventLoc: 'São Paulo', eventDate: new Date(), createdBy: testUser._id },
        { title: 'Palestra Python', desc: 'Descrição 2', eventLoc: 'Rio de Janeiro', eventDate: new Date(), createdBy: testUser._id }
      ]);

      const response = await request(app)
        .get('/api/events/search')
        .query({ eventLoc: 'São Paulo' });

      expect(response.status).toBe(200);
      expect(response.body.eventLoc).toBe('São Paulo');
      expect(response.body.title).toBe('Workshop JS');
    });

    it('deve retornar 404 se nenhum registro corresponder aos parâmetros', async () => {
      const response = await request(app)
        .get('/api/events/search')
        .query({ eventLoc: 'Curitiba' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Registro não encontrado');
    });
  });

  describe('GET /api/events/:id', () => {
    it('deve retornar um evento específico pelo ID', async () => {
      const event = await Event.create({
        title: 'Evento Específico',
        desc: 'Descrição específica',
        eventLoc: 'Local Específico',
        eventDate: new Date(),
        createdBy: testUser._id
      });

      const response = await request(app).get(`/api/events/${event._id}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Evento Específico');
      expect(response.body._id).toBe(event._id.toString());
    });

    it('deve retornar 404 se o ID do evento não for encontrado', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/events/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Registro não encontrado');
    });
  });

  describe('POST /api/events', () => {
    it('deve impedir a criação de um evento sem token de autenticação', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          title: 'Evento Não Autorizado',
          desc: 'Descrição',
          eventLoc: 'Local',
          eventDate: new Date()
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve criar um novo evento com sucesso ao enviar token válido', async () => {
      const eventData = {
        title: 'Novo Evento de Teste',
        desc: 'Esta é a descrição do evento de teste.',
        eventLoc: 'Auditório Principal',
        eventDate: new Date().toISOString(),
        imageUrl: 'http://link.com/imagem.png'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Evento criado com sucesso!');
      expect(response.body.newEvent.title).toBe(eventData.title);
      expect(response.body.newEvent.createdBy).toBe(testUser._id.toString());
    });
  });

  describe('PUT /api/events/:id', () => {
    it('deve impedir a atualização de um evento sem token de autenticação', async () => {
      const event = await Event.create({
        title: 'Título Original',
        desc: 'Descrição Original',
        eventLoc: 'Local',
        eventDate: new Date(),
        createdBy: testUser._id
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .send({ title: 'Título Atualizado' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve atualizar um evento com sucesso ao enviar token válido', async () => {
      const event = await Event.create({
        title: 'Título Original',
        desc: 'Descrição Original',
        eventLoc: 'Local',
        eventDate: new Date(),
        createdBy: testUser._id
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Título Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registro atualizado com sucesso!');
      expect(response.body.updatedDoc.title).toBe('Título Atualizado');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('deve impedir a remoção de um evento sem token de autenticação', async () => {
      const event = await Event.create({
        title: 'Evento a Deletar',
        desc: 'Descrição',
        eventLoc: 'Local',
        eventDate: new Date(),
        createdBy: testUser._id
      });

      const response = await request(app).delete(`/api/events/${event._id}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve remover um evento com sucesso ao enviar token válido', async () => {
      const event = await Event.create({
        title: 'Evento a Deletar',
        desc: 'Descrição',
        eventLoc: 'Local',
        eventDate: new Date(),
        createdBy: testUser._id
      });

      const response = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registro removido com sucesso!');

      const checkEvent = await Event.findById(event._id);
      expect(checkEvent).toBeNull();
    });
  });
});
