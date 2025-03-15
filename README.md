# WhatsApp Business Dashboard

Uma aplicação web completa para controle e gerenciamento do WhatsApp Business, permitindo envio de mensagens, automações, análises e muito mais.

## 📋 Visão Geral

Este projeto consiste em duas partes principais:

1. **Backend (API do WhatsApp)**: Um servidor Node.js que se conecta ao WhatsApp usando a biblioteca whatsapp-web.js e expõe endpoints RESTful para interagir com o WhatsApp.

2. **Frontend (Dashboard)**: Uma aplicação Next.js com TypeScript e Shadcn UI que fornece uma interface amigável para gerenciar conversas, enviar mensagens, configurar automações e visualizar análises.

## ✨ Funcionalidades

- 🔐 **Autenticação e gerenciamento de usuários**
  - Login/registro de usuários
  - Perfis de usuário com diferentes níveis de acesso

- 📱 **Conexão com WhatsApp**
  - Autenticação via QR code
  - Status da conexão (conectado/desconectado)
  - Reconexão automática

- 💬 **Gerenciamento de conversas**
  - Visualização de todas as conversas
  - Filtro e busca de conversas
  - Visualização de mensagens por conversa

- 📤 **Envio de mensagens**
  - Envio de mensagens de texto
  - Envio de mídia (imagens, documentos, etc.)
  - Envio de mensagens em massa

- 🤖 **Automações**
  - Respostas automáticas
  - Mensagens programadas
  - Fluxos de conversação

- 📊 **Análises e relatórios**
  - Estatísticas de mensagens enviadas/recebidas
  - Tempo de resposta
  - Conversas ativas

- ⚙️ **Configurações**
  - Personalização de mensagens
  - Configuração de notificações
  - Backup e restauração

## 🛠️ Tecnologias

### Backend
- Node.js e Express
- whatsapp-web.js
- Puppeteer
- MongoDB e Mongoose
- JWT
- Socket.io

### Frontend
- Next.js 14 com App Router
- TypeScript
- Shadcn UI e Tailwind CSS
- React Query
- NextAuth.js
- Recharts
- Zod

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18 ou superior
- MongoDB
- Navegador Chromium (para o whatsapp-web.js)

### Backend

```bash
# Clone o repositório
git clone https://github.com/Vitin11a/whatsapp-business-dashboard.git
cd whatsapp-business-dashboard

# Instale as dependências do backend
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o servidor
npm run dev
```

### Frontend

```bash
# Na raiz do projeto
cd frontend

# Instale as dependências do frontend
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request