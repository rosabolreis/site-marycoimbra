# Site — Mary Coimbra | Jornalista

Site institucional com backend próprio para receber mensagens de contato e
para gerenciar o conteúdo (vídeos, portfólio, entrevistas) sem precisar
editar HTML.

## Estrutura do projeto

```
mary-coimbra-site/
├── server.js              → backend (Express)
├── package.json
├── .env.example           → variáveis de ambiente (copie para .env)
├── data/
│   ├── conteudos.json      → vídeos, portfólio e entrevistas do site
│   └── mensagens.json      → mensagens recebidas pelo formulário de contato
└── public/
    └── index.html           → o site (front-end)
```

## Como rodar localmente

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou mais recente).
2. Na pasta do projeto, rode:
   ```
   npm install
   cp .env.example .env
   npm start
   ```
3. Abra `http://localhost:3000` no navegador.

O site e o backend rodam juntos nesse mesmo servidor — não precisa de dois
serviços separados.

## Como publicar (deixar no ar de verdade)

Qualquer serviço que rode Node.js funciona. As opções mais simples e com
plano gratuito para começar:

- **Render** (render.com) — conecta direto num repositório do GitHub.
- **Railway** (railway.app)
- **Fly.io**

Em qualquer um desses, o comando de start é `npm start` e a porta vem da
variável de ambiente `PORT` (o `server.js` já está preparado pra isso).
Lembre de configurar lá as variáveis do `.env` (principalmente `ADMIN_TOKEN`,
trocando pelo valor de exemplo).

Se preferir, me avise e eu te ajudo a preparar o repositório do GitHub e o
deploy passo a passo num desses serviços.

---

## Como adicionar conteúdo

Todo o conteúdo dinâmico do site (vídeos, portfólio, entrevistas) vive no
arquivo `data/conteudos.json`. O site lê esse arquivo automaticamente — você
não precisa tocar no HTML.

Há duas formas de editar:

### Opção 1 — Editar o arquivo JSON direto (mais simples)

Abra `data/conteudos.json` em qualquer editor de texto e adicione um novo
bloco na lista certa. Depois de salvar, é só reiniciar o servidor
(`npm start`) — ou, se estiver publicado, fazer o redeploy.

### Opção 2 — Usar a API (sem mexer em arquivo)

Isso é útil se o site já estiver publicado e você quiser adicionar conteúdo
sem acessar o servidor diretamente. Envie uma requisição com o token de
administrador (`ADMIN_TOKEN` do seu `.env`) no cabeçalho `x-admin-token`.
Dá pra fazer isso com o app **Postman**, **Insomnia**, ou até um comando
`curl`.

Exemplo (adicionar um vídeo):
```
curl -X POST http://SEU-SITE/api/conteudos/videos \
  -H "Content-Type: application/json" \
  -H "x-admin-token: SEU_TOKEN_AQUI" \
  -d '{
        "categoria": "Cobertura",
        "titulo": "Título da matéria",
        "legenda": "Frase de abertura do vídeo",
        "capa": "URL_DA_IMAGEM_DE_CAPA",
        "url": "URL_DO_VIDEO_NO_YOUTUBE"
      }'
```

O mesmo funciona para `portfolio` e `entrevistas`, trocando o campo final da
URL (`/api/conteudos/portfolio` ou `/api/conteudos/entrevistas`) e os campos
do corpo da requisição — veja os modelos abaixo.

Para editar um item existente: `PUT /api/conteudos/{lista}/{id}`.
Para remover: `DELETE /api/conteudos/{lista}/{id}`.

---

### 🎥 Adicionando vídeos

Cada vídeo no array `"videos"` tem estes campos:

| Campo       | O que é                                              |
|-------------|-------------------------------------------------------|
| `categoria` | Rótulo mostrado no card (ex: "Cobertura", "Ao vivo")   |
| `titulo`    | Título interno do vídeo                                |
| `legenda`   | Frase curta mostrada no card (a "chamada" do vídeo)    |
| `capa`      | URL da imagem de capa/thumbnail                        |
| `url`       | Link do vídeo (YouTube, Instagram, etc.)               |

**Capas de vídeo do YouTube automaticamente:**
Se o vídeo já está no YouTube, você não precisa subir uma imagem — o
YouTube já gera a capa pra você. Pegue o ID do vídeo (a parte depois de
`v=` no link) e monte a URL assim:

```
https://img.youtube.com/vi/ID_DO_VIDEO/maxresdefault.jpg
```

Exemplo: se o link é `https://youtube.com/watch?v=ABC123`, a capa é
`https://img.youtube.com/vi/ABC123/maxresdefault.jpg`.

Se quiser usar uma imagem própria (feita no Canva, por exemplo), basta subir
essa imagem em algum lugar com link direto (o próprio YouTube/Instagram, um
Google Drive público, ou um serviço de imagens) e colar o link no campo
`capa`.

---

### 📌 Adicionando reportagens ao portfólio

Cada item no array `"portfolio"`:

| Campo      | O que é                                                        |
|------------|------------------------------------------------------------------|
| `categoria`| Uma das etiquetas usadas no site (Segurança, Política, TV, Entrevistas, Coberturas, Premiações) |
| `titulo`   | Título da reportagem                                              |
| `fixado`   | `true` para mostrar o ícone de fixado (📌), `false` caso contrário |
| `capa`     | URL da imagem de capa da matéria                                  |
| `url`      | Link para a matéria completa (YouTube, matéria publicada, etc.)   |
| `fontes`   | Lista de fontes de pesquisa usadas na apuração (veja abaixo)      |

---

### 📚 Fontes de pesquisa

Cada reportagem no portfólio pode ter uma lista de fontes — elas aparecem
como um botão "Fontes" no card, que abre uma janela com a lista e os links.
Isso serve tanto para transparência editorial quanto para embasar o
conteúdo diante de emissoras parceiras.

```json
"fontes": [
  { "nome": "Boletim de ocorrência - SSP/MA", "link": "" },
  { "nome": "Entrevista com delegado responsável", "link": "https://..." }
]
```

- `nome`: como a fonte aparece na lista (documento, pessoa, órgão, etc.)
- `link`: opcional — se preenchido, o nome vira um link clicável; se vazio,
  aparece só como texto (útil para fontes que não têm um link público,
  como um documento físico ou uma fonte protegida).

---

### 🎙 Adicionando entrevistas

Cada item no array `"entrevistas"`:

| Campo       | O que é                                   |
|-------------|--------------------------------------------|
| `categoria` | Rótulo mostrado antes do título             |
| `titulo`    | Título/chamada da entrevista                |
| `url`       | Link da entrevista (opcional)               |

---

## Mensagens de contato

Toda mensagem enviada pelo formulário do site é salva em
`data/mensagens.json` — nada se perde mesmo se o e-mail não estiver
configurado.

Para ver as mensagens recebidas:
```
curl http://SEU-SITE/api/mensagens -H "x-admin-token: SEU_TOKEN_AQUI"
```

### Receber por e-mail também (opcional)

Se quiser que cada mensagem chegue direto no seu e-mail, preencha no `.env`:

```
SMTP_HOST=smtp.seuservidor.com
SMTP_PORT=587
SMTP_USER=seuemail@dominio.com
SMTP_PASS=sua-senha-de-app
CONTATO_DESTINO=paraonde@quervoce-receber.com
```

Serviços como Gmail, Outlook ou qualquer provedor de e-mail com SMTP
funcionam — para o Gmail, é preciso gerar uma "senha de app" nas
configurações de segurança da conta, em vez da senha normal.

Se `SMTP_HOST` ficar vazio, o site continua funcionando normalmente — as
mensagens só ficam salvas em `data/mensagens.json`, sem envio por e-mail.

---

## Segurança do token de administrador

O `ADMIN_TOKEN` protege as rotas que alteram conteúdo e a leitura das
mensagens de contato. Antes de publicar o site:

1. Troque o valor de exemplo no `.env` por algo único e difícil de adivinhar.
2. Nunca coloque esse token direto no HTML público — ele deve ficar só no
   `.env` do servidor e ser usado apenas em ferramentas como Postman/curl
   quando você for administrar o conteúdo.