# WhatsApp Business Dashboard - Frontend

Este é o frontend do WhatsApp Business Dashboard, uma aplicação web para gerenciar conversas e automatizar atendimentos no WhatsApp Business.

## Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Linguagem de programação tipada
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn UI**: Componentes de UI reutilizáveis
- **React Query**: Gerenciamento de estado e cache para requisições
- **Next Auth**: Autenticação de usuários
- **Socket.io**: Comunicação em tempo real

## Estrutura do Projeto

```
frontend/
├── app/                  # Rotas e páginas da aplicação
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI básicos
│   └── ...               # Outros componentes
├── hooks/                # Hooks personalizados
├── lib/                  # Utilitários e funções auxiliares
├── public/               # Arquivos estáticos
└── ...                   # Arquivos de configuração
```

## Configuração

1. Clone o repositório
2. Navegue até a pasta do frontend: `cd frontend`
3. Instale as dependências: `npm install` ou `yarn install`
4. Copie o arquivo `.env.example` para `.env.local` e configure as variáveis de ambiente
5. Execute o servidor de desenvolvimento: `npm run dev` ou `yarn dev`

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto frontend com as seguintes variáveis:

```
# Configurações da API
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Configurações do NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Configurações do Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter para verificar problemas no código

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de conversas do WhatsApp
- Automação de mensagens
- Análise de dados e métricas
- Integração com API do WhatsApp Business