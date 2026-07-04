import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import app from '../app.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

describe('Testes da API de Posts', () => {
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

  // Limpa a coleção de posts antes de cada teste
  beforeEach(async () => {
    await Post.deleteMany({});
  });

  // Fecha a conexão do banco de dados
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/posts', () => {
    it('deve retornar uma lista vazia quando não houver posts', async () => {
      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('deve retornar todos os posts existentes', async () => {
      // Insere posts mockados
      await Post.create([
        { title: 'Post 1', content: 'Conteúdo do Post 1', author: 'Autor A', createdBy: testUser._id },
        { title: 'Post 2', content: 'Conteúdo do Post 2', author: 'Autor B', createdBy: testUser._id }
      ]);

      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      const titles = response.body.map(post => post.title);
      expect(titles).toContain('Post 1');
      expect(titles).toContain('Post 2');
    });
  });

  describe('GET /api/posts/search (Busca por parâmetros)', () => {
    it('deve filtrar os posts baseado nos parâmetros de consulta (query params)', async () => {
      await Post.create([
        { title: 'Tecnologia Avançada', content: 'Conteúdo 1', author: 'Pedro', createdBy: testUser._id },
        { title: 'Culinária Italiana', content: 'Conteúdo 2', author: 'Maria', createdBy: testUser._id }
      ]);

      // Busca apenas posts do autor "Pedro"
      const response = await request(app)
        .get('/api/posts/search')
        .query({ author: 'Pedro' });

      expect(response.status).toBe(200);
      expect(response.body.author).toBe('Pedro');
      expect(response.body.title).toBe('Tecnologia Avançada');
    });

    it('deve retornar 404 se nenhum registro corresponder aos parâmetros', async () => {
      const response = await request(app)
        .get('/api/posts/search')
        .query({ author: 'AutorInexistente' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Registro não encontrado');
    });
  });

  describe('POST /api/posts', () => {
    it('deve impedir a criação de um post sem token de autenticação', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Post Proibido',
          content: 'Conteúdo',
          author: 'Sem Login'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve criar um novo post com sucesso ao enviar token válido', async () => {
      const postData = {
        title: 'Novo Post de Teste',
        subtitle: 'Subtítulo do teste',
        content: 'Este é o conteúdo do teste do post.',
        author: 'Autor de Teste',
        imageUrl: 'http://link.com/imagem.png'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send(postData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Novo post criado com sucesso!');
      expect(response.body.newPost.title).toBe(postData.title);
      expect(response.body.newPost.createdBy).toBe(testUser._id.toString());
    });
  });

  describe('GET /api/posts/:id', () => {
    it('deve retornar um post específico pelo ID', async () => {
      const post = await Post.create({
        title: 'Post Específico',
        content: 'Conteúdo do post específico',
        author: 'Autor C',
        createdBy: testUser._id
      });

      const response = await request(app).get(`/api/posts/${post._id}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Post Específico');
      expect(response.body._id).toBe(post._id.toString());
    });

    it('deve retornar 404 se o ID do post não for encontrado', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/posts/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Registro não encontrado');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('deve impedir a atualização de um post sem token de autenticação', async () => {
      const post = await Post.create({
        title: 'Título Original',
        content: 'Conteúdo Original',
        author: 'Autor',
        createdBy: testUser._id
      });

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: 'Título Atualizado' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve atualizar um post com sucesso ao enviar token válido', async () => {
      const post = await Post.create({
        title: 'Título Original',
        content: 'Conteúdo Original',
        author: 'Autor',
        createdBy: testUser._id
      });

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Título Atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registro atualizado com sucesso!');
      expect(response.body.updatedDoc.title).toBe('Título Atualizado');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('deve impedir a remoção de um post sem token de autenticação', async () => {
      const post = await Post.create({
        title: 'Post a Deletar',
        content: 'Conteúdo',
        author: 'Autor',
        createdBy: testUser._id
      });

      const response = await request(app).delete(`/api/posts/${post._id}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('deve remover um post com sucesso ao enviar token válido', async () => {
      const post = await Post.create({
        title: 'Post a Deletar',
        content: 'Conteúdo',
        author: 'Autor',
        createdBy: testUser._id
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registro removido com sucesso!');

      // Verifica se realmente foi removido do banco de dados
      const checkPost = await Post.findById(post._id);
      expect(checkPost).toBeNull();
    });
  });
});
