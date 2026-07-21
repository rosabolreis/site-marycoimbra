require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'troque-este-token';

const CONTEUDOS_PATH = path.join(__dirname, 'data', 'conteudos.json');
const MENSAGENS_PATH = path.join(__dirname, 'data', 'mensagens.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Helpers de leitura/escrita ----------
function lerJSON(caminho) {
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  return JSON.parse(conteudo);
}

function salvarJSON(caminho, dados) {
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
}

function exigirAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ erro: 'Token de administrador inválido ou ausente.' });
  }
  next();
}

// ---------- Conteúdo público (vídeos, portfólio, entrevistas) ----------

// Retorna todo o conteúdo do site
app.get('/api/conteudos', (req, res) => {
  try {
    const dados = lerJSON(CONTEUDOS_PATH);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível carregar os conteúdos.' });
  }
});

// Adiciona um item a uma lista (videos | portfolio | entrevistas)
app.post('/api/conteudos/:lista', exigirAdmin, (req, res) => {
  const { lista } = req.params;
  const listasValidas = ['videos', 'portfolio', 'entrevistas'];
  if (!listasValidas.includes(lista)) {
    return res.status(400).json({ erro: `Lista inválida. Use uma de: ${listasValidas.join(', ')}` });
  }

  const dados = lerJSON(CONTEUDOS_PATH);
  const novoItem = { id: `${lista.slice(0, 1)}${Date.now()}`, ...req.body };
  dados[lista].push(novoItem);
  salvarJSON(CONTEUDOS_PATH, dados);
  res.status(201).json(novoItem);
});

// Atualiza um item existente pelo id
app.put('/api/conteudos/:lista/:id', exigirAdmin, (req, res) => {
  const { lista, id } = req.params;
  const dados = lerJSON(CONTEUDOS_PATH);
  if (!dados[lista]) return res.status(400).json({ erro: 'Lista inválida.' });

  const indice = dados[lista].findIndex((item) => item.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Item não encontrado.' });

  dados[lista][indice] = { ...dados[lista][indice], ...req.body, id };
  salvarJSON(CONTEUDOS_PATH, dados);
  res.json(dados[lista][indice]);
});

// Remove um item pelo id
app.delete('/api/conteudos/:lista/:id', exigirAdmin, (req, res) => {
  const { lista, id } = req.params;
  const dados = lerJSON(CONTEUDOS_PATH);
  if (!dados[lista]) return res.status(400).json({ erro: 'Lista inválida.' });

  const antes = dados[lista].length;
  dados[lista] = dados[lista].filter((item) => item.id !== id);
  if (dados[lista].length === antes) return res.status(404).json({ erro: 'Item não encontrado.' });

  salvarJSON(CONTEUDOS_PATH, dados);
  res.json({ removido: id });
});

// ---------- Formulário de contato ----------

app.post('/api/contato', async (req, res) => {
  const { nome, org, assunto, mensagem, email } = req.body;

  if (!nome || !mensagem) {
    return res.status(400).json({ erro: 'Nome e mensagem são obrigatórios.' });
  }

  const registro = {
    id: `m${Date.now()}`,
    nome,
    org: org || '',
    assunto: assunto || 'Não informado',
    mensagem,
    email: email || '',
    recebidoEm: new Date().toISOString(),
  };

  try {
    const mensagens = lerJSON(MENSAGENS_PATH);
    mensagens.push(registro);
    salvarJSON(MENSAGENS_PATH, mensagens);
  } catch (erro) {
    return res.status(500).json({ erro: 'Não foi possível salvar a mensagem.' });
  }

  // Envio de e-mail opcional: só ativa se as variáveis SMTP estiverem definidas no .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.CONTATO_DESTINO || process.env.SMTP_USER,
        subject: `[Site] Nova mensagem: ${registro.assunto}`,
        text: `Nome: ${registro.nome}\nOrganização: ${registro.org}\nE-mail: ${registro.email}\nAssunto: ${registro.assunto}\n\n${registro.mensagem}`,
      });
    } catch (erro) {
      console.error('Falha ao enviar e-mail (mensagem já foi salva):', erro.message);
    }
  }

  res.status(201).json({ ok: true, mensagem: 'Mensagem recebida com sucesso.' });
});

// Lista mensagens recebidas (protegido)
app.get('/api/mensagens', exigirAdmin, (req, res) => {
  try {
    const mensagens = lerJSON(MENSAGENS_PATH);
    res.json(mensagens);
  } catch (erro) {
    res.status(500).json({ erro: 'Não foi possível carregar as mensagens.' });
  }
});

app.listen(PORT, "0.0.0.0",  () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
