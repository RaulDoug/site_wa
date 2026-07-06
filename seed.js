import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import Post from './src/models/postModel.js';
import Event from './src/models/eventModel.js';

const rodarSeed = async () => {
  try {
    // 1. Conecta ao banco de dados
    console.log('🌱 Conectando ao MongoDB para rodar o Seed...');
    await mongoose.connect(process.env.MONGO_URL);

    // 2. Busca um usuário existente no banco para ser o autor
    const usuarioAdmin = await User.findOne();
    if (!usuarioAdmin) {
      console.error('❌ Erro: Nenhum usuário encontrado no banco. Cadastre um usuário via Postman primeiro!');
      process.exit(1);
    }

    const autorId = usuarioAdmin._id;
    console.log(`👤 Utilizando o usuário "${usuarioAdmin.nome}" como criador dos registros.`);

    // 3. Limpa os posts e eventos antigos para evitar duplicidade nos testes
    await Post.deleteMany({});
    await Event.deleteMany({});
    console.log('🧹 Coleções de Posts e Eventos limpas com sucesso.');

    // 4. Massa de dados para 3 Posts do Blog de Contabilidade
    const postsSeed = [
      {
        title: 'Planejamento Tributário para 2027',
        subtitle: 'Como reduzir impostos legalmente no próximo ano',
        content: 'O planejamento tributário é a melhor ferramenta para micro e pequenas empresas organizarem suas finanças e evitarem pagar impostos desnecessários...',
        imageUrl: 'https://imagens.com/blog/planejamento-tributario.jpg',
        author: 'Suporte Técnico WA',
        createdBy: autorId
      },
      {
        title: 'Mudanças na Declaração do MEI',
        subtitle: 'Fique atento aos novos prazos e limites',
        content: 'O governo federal propôs novas regras de faturamento para o Microempreendedor Individual. Neste artigo, detalhamos o que muda para o seu negócio...',
        imageUrl: 'https://imagens.com/blog/mei-mudancas.jpg',
        author: 'Contabilidade WA',
        createdBy: autorId
      },
      {
        title: 'Como organizar o fluxo de caixa da sua empresa',
        subtitle: 'Passo a passo simples para não fechar no vermelho',
        content: 'Misturar contas pessoais com as contas da empresa é o erro número um dos empreendedores. Entenda como separar o caixa de forma definitiva...',
        imageUrl: 'https://imagens.com/blog/fluxo-caixa.jpg',
        author: 'Contabilidade WA',
        createdBy: autorId
      }
    ];

    // 5. Massa de dados para 3 Eventos da Agenda
    const eventosSeed = [
      {
        title: 'Workshop: Declaração de Faturamento MEI',
        desc: 'Treinamento prático presencial para clientes da contabilidade organizarem seus relatórios anuais.',
        imageUrl: 'https://imagens.com/eventos/workshop-mei.jpg',
        eventLoc: 'Auditório Central - Bom Despacho',
        eventDate: new Date('2026-08-15T19:00:00Z'),
        createdBy: autorId
      },
      {
        title: 'Palestra: Impactos da Reforma Tributária',
        desc: 'Uma análise profunda de como a transição dos novos impostos vai impactar o comércio local.',
        imageUrl: 'https://imagens.com/eventos/palestra-reforma.jpg',
        eventLoc: 'Associação Comercial',
        eventDate: new Date('2026-09-10T14:30:00Z'),
        createdBy: autorId
      },
      {
        title: 'Consultoria Coletiva: Planejamento de Fim de Ano',
        desc: 'Rodada de perguntas e respostas exclusiva para traçar metas fiscais antes do fechamento do ano.',
        imageUrl: 'https://imagens.com/eventos/consultoria-coletiva.jpg',
        eventLoc: 'Sala de Reuniões WA Contabilidade',
        eventDate: new Date('2026-11-05T09:00:00Z'),
        createdBy: autorId
      }
    ];

    // 6. Injeta os dados no MongoDB
    await Post.insertMany(postsSeed);
    console.log('📚 3 Posts inseridos com sucesso!');

    await Event.insertMany(eventosSeed);
    console.log('📅 3 Eventos inseridos com sucesso!');

    console.log('🎉 Script de Seed finalizado com sucesso absoluto!');
  } catch (error) {
    console.error('❌ Erro ao rodar o seed:', error);
  } finally {
    // 7. Desconecta do banco de dados para o script não ficar travado no terminal
    await mongoose.disconnect();
    process.exit(0);
  }
};

rodarSeed();
