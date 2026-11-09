# Freelance — Frontend

Interface web da plataforma **Freelance**, que conecta clientes a prestadores de serviço. Feita em React + TypeScript, com layout pensado primeiro para o celular.

A API (Laravel) fica no repositório [freelance-backend](https://github.com/euAlexandreD/freelance-backend). Ela precisa estar rodando para o frontend funcionar.

## Telas

| Rota | Tela |
|---|---|
| `/` | Login e cadastro |
| `/servicos` | Catálogo com filtro por categoria: foto, título, preço, nota e prestador |
| `/prestadores/:id` | Perfil público do prestador: serviços, avaliações e serviços concluídos |
| `/perfil` | Meu perfil: dados, foto e tipo de conta (cliente ou prestador) |
| `/meus-servicos` | O prestador cadastra, edita, pausa e exclui serviços e gerencia as fotos |
| `/meus-pedidos` | O cliente acompanha seus pedidos, conversa com o prestador, cancela e avalia os concluídos |
| `/pedidos-recebidos` | O prestador conversa com o cliente, aceita, recusa e conclui pedidos e vê as avaliações recebidas |

A conversa do pedido busca mensagens novas a cada 5 segundos enquanto está aberta e a aba está visível. Os links dos e-mails (`/meus-pedidos?pedido=ID`) abrem direto a conversa daquele pedido.

As fotos são reduzidas no navegador (até 1600 px, em JPEG) antes do envio. Assim, fotos de celular de vários MB chegam ao servidor com algumas centenas de KB.

## Tecnologias

- React 19 + TypeScript
- Vite 8
- React Router 7
- [Tabler Icons](https://tabler.io/icons)
- Oxlint para lint

## Pré-requisitos

- Node.js 20.19+ (ou 22.12+) e npm
- A [API](https://github.com/euAlexandreD/freelance-backend) rodando em `http://localhost:8000`

## Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure a URL da API
cp .env.example .env

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5199**. O servidor também fica acessível pela rede local, o que permite testar no celular pelo IP da máquina.

Para entrar, use um dos usuários de demonstração criados pelo seeder da API, por exemplo `test@example.com` com a senha `password`. A lista completa está no [README da API](https://github.com/euAlexandreD/freelance-backend#dados-de-demonstração).

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API | `http://localhost:8000/api` |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento na porta 5199 |
| `npm run build` | Checagem de tipos e build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Roda o Oxlint |

## Estrutura

```
src/
├── components/   # Peças reutilizáveis: ServicoCard, ServicoForm, FotosServico, Estrelas, Avatar...
├── lib/
│   ├── api.ts      # apiFetch: chamadas à API com o token salvo
│   ├── format.ts   # Formatação de preço, nota e data; redução de imagens
│   ├── fotos.ts    # Envio de fotos dos serviços
│   └── types.ts    # Tipos das respostas da API
├── pages/        # Uma tela por rota
├── styles/       # Estilos compartilhados de formulário
└── index.css     # Cores e variáveis do tema (escuro)
```
