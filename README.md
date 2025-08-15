# CS2 Pixels - Documentação do Projeto

## 🎯 Objetivo do Projeto

**CS2 Pixels** é uma plataforma web que permite aos jogadores de Counter-Strike 2 encontrar rapidamente vídeos de jogadas específicas (pixels) através de uma busca por texto. O sistema funciona como um "YouTube" especializado para CS2, onde cada vídeo é categorizado com tags específicas para facilitar a busca.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Next.js 15** com App Router (estrutura moderna)
- **React 19** com TypeScript para tipagem segura
- **CSS Modules** para estilização isolada
- **Heroicons** para ícones

### Backend
- **API Routes** do Next.js para endpoints
- **Firebase** como banco de dados e autenticação
  - Firestore (banco de dados)
  - Storage (armazenamento de vídeos)
  - Auth (sistema de login)

## 📁 Estrutura do Projeto

```
cs2-pixels/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── page.tsx           # Página principal (busca)
│   │   ├── api/search/        # API de busca
│   │   └── admin/             # Área administrativa
│   │       ├── login/         # Login de administradores
│   │       └── dashboard/     # Painel para adicionar vídeos
│   └── lib/
│       └── firebase.ts        # Configuração do Firebase
├── public/                     # Arquivos estáticos
└── package.json               # Dependências do projeto
```

## 🚀 Como Executar o Projeto

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração do Firebase
Crie um arquivo `.env.local` na raiz do projeto com suas credenciais:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 3. Executar o Projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔍 Como Funciona a Busca

### 1. Interface do Usuário
- O usuário digita uma descrição da jogada (ex: "Mirage base TR smokar janela")
- O sistema processa o texto e extrai palavras-chave
- Busca no banco de dados por vídeos com tags correspondentes

### 2. Processamento da Busca
```typescript
// O sistema divide o texto em palavras-chave
const keywords = searchTerm
  .toLowerCase()
  .split(/\s+/)                    // Divide por espaços
  .filter((word) => word.length > 2); // Remove palavras muito pequenas
```

### 3. Consulta no Firestore
```typescript
// Busca em documentos onde o array 'tags' contenha qualquer palavra-chave
const q = query(
  videosCollection,
  where('tags', 'array-contains-any', keywords),
  limit(1)
);
```

## 👨‍💼 Sistema Administrativo

### Acesso
- URL: `/admin/login`
- Sistema de autenticação com Firebase Auth
- Apenas usuários autorizados podem acessar

### Funcionalidades
- **Upload de Vídeos**: Envio de arquivos MP4 para o Firebase Storage
- **Metadados**: Preenchimento de informações como mapa, posição, ação, destino
- **Tags**: Sistema de categorização para facilitar a busca
- **Progresso**: Barra de progresso durante o upload

### Estrutura dos Dados
```typescript
interface VideoData {
  mapa: string;              // Ex: "mirage", "inferno"
  posicao_inicial: string;   // Ex: "base TR", "CT spawn"
  acao: string;              // Ex: "smoke", "flash", "molotov"
  destino: string;           // Ex: "janela", "mid", "B site"
  url_video: string;         // URL do vídeo no Firebase Storage
  tags: string[];            // Array de tags para busca
  createdAt: Timestamp;      // Data de criação
}
```

## 🎨 Componentes Principais

### 1. Página Principal (`page.tsx`)
- Formulário de busca responsivo
- Estados para loading, erro e resultado
- Player de vídeo integrado
- Tratamento de erros amigável

### 2. API de Busca (`/api/search`)
- Processamento de texto de entrada
- Consulta otimizada no Firestore
- Tratamento de erros HTTP
- Resposta padronizada

### 3. Dashboard Admin
- Formulário de upload com validação
- Upload progressivo com barra de progresso
- Sistema de feedback para o usuário
- Logout integrado

## 🔧 Tecnologias e Bibliotecas

### Core
- **Next.js 15**: Framework React com SSR e API Routes
- **React 19**: Biblioteca para interfaces de usuário
- **TypeScript**: Tipagem estática para JavaScript

### Firebase
- **Firestore**: Banco de dados NoSQL
- **Storage**: Armazenamento de arquivos
- **Auth**: Autenticação de usuários

### UI/UX
- **Heroicons**: Ícones SVG de alta qualidade
- **CSS Modules**: Estilização com escopo isolado
- **Responsive Design**: Interface adaptável a diferentes dispositivos

## 📝 Padrões de Código

### 1. Nomenclatura
- **Componentes**: PascalCase (ex: `DashboardPage`)
- **Funções**: camelCase (ex: `handleSearch`)
- **Arquivos**: kebab-case (ex: `dashboard.module.css`)

### 2. Estrutura de Estados
```typescript
// Estados relacionados agrupados
const [searchTerm, setSearchTerm] = useState('');
const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 3. Tratamento de Erros
- Try-catch em operações assíncronas
- Estados de erro específicos
- Mensagens amigáveis para o usuário

## 🚨 Pontos de Atenção

### 1. Variáveis de Ambiente
- **NUNCA** commitar o arquivo `.env.local`
- Todas as credenciais do Firebase devem estar nas variáveis de ambiente
- Prefixo `NEXT_PUBLIC_` é necessário para variáveis acessíveis no frontend

### 2. Segurança
- Apenas usuários autenticados podem acessar o dashboard
- Validação de entrada em todas as APIs
- Limite de upload configurado no Firebase

### 3. Performance
- Limite de 1 resultado por busca (otimização)
- Upload progressivo para arquivos grandes
- Lazy loading de componentes quando possível

## 🔄 Fluxo de Desenvolvimento

### 1. Para Adicionar Novas Funcionalidades
1. Crie um branch específico para a feature
2. Implemente a funcionalidade seguindo os padrões do projeto
3. Teste localmente com `npm run dev`
4. Faça commit com mensagem descritiva
5. Crie um Pull Request

### 2. Para Modificar a Busca
- Edite `src/app/api/search/route.ts`
- Modifique a lógica de processamento de palavras-chave
- Ajuste as consultas no Firestore conforme necessário

### 3. Para Alterar a Interface
- Modifique os componentes React em `src/app/`
- Ajuste os estilos nos arquivos `.module.css`
- Mantenha a responsividade e acessibilidade

## 📚 Recursos de Aprendizado

### Next.js
- [Documentação Oficial](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

### Firebase
- [Firestore](https://firebase.google.com/docs/firestore)
- [Storage](https://firebase.google.com/docs/storage)
- [Auth](https://firebase.google.com/docs/auth)

### React
- [Hooks](https://react.dev/reference/react/hooks)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 🤝 Contribuição

Este é um projeto de estudo colaborativo. Para contribuir:

1. **Entenda o código** antes de modificar
2. **Mantenha a consistência** com os padrões existentes
3. **Teste suas mudanças** antes de commitar
4. **Documente alterações** importantes
5. **Peça ajuda** quando necessário

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique a documentação acima
- Analise o código existente
- Consulte a documentação das tecnologias utilizadas
- Discuta com a equipe antes de implementar mudanças grandes

---

**Desenvolvido com ❤️ para aprendizado colaborativo em desenvolvimento web**
