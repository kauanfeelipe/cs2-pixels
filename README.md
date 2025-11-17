#  CS2 Pixels

## Contexto do Projeto

Este projeto foi desenvolvido como trabalho acadêmico para a disciplina de **Análise/Projetos de Sistema**, apresentado durante o semestre. O objetivo da atividade era desenvolver um sistema completo que envolvesse **banco de dados** e **programação**, demonstrando a aplicação prática dos conceitos estudados em sala de aula.

O **CS2 Pixels** foi escolhido como tema por combinar diferentes tecnologias e desafios técnicos, incluindo:
- Desenvolvimento de interface web moderna
- Integração com banco de dados NoSQL (Firestore)
- Gerenciamento de arquivos (Firebase Storage)
- Sistema de autenticação e autorização
- APIs RESTful para comunicação entre frontend e backend

## Visão Geral

O CS2 Pixels é uma plataforma web para busca e visualização de vídeos de jogadas do Counter-Strike 2. O sistema permite que usuários encontrem vídeos específicos através de filtros estruturados (mapa e ação) e busca por texto livre.

## Arquitetura do Sistema

### Tecnologias Utilizadas

- **Frontend**: Next.js 15 com React 19 e TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: Firebase Firestore
- **Armazenamento**: Firebase Storage
- **Autenticação**: Firebase Authentication

### Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Página principal (busca pública)
│   ├── api/search/route.ts   # API de busca
│   └── admin/                # Área administrativa
│       ├── login/            # Autenticação
│       └── dashboard/        # Gerenciamento de vídeos
└── lib/
    └── firebase.ts           # Configuração do Firebase
```

## Fluxo de Funcionamento

### 1. Busca de Vídeos (Público)

**Processo**:
1. Usuário seleciona mapa e ação nos filtros obrigatórios
2. Opcionalmente, digita texto para refinar a busca
3. Sistema envia requisição para a API de busca
4. API consulta o Firestore com filtros aplicados
5. Retorna o primeiro vídeo que corresponde aos critérios
6. Vídeo é exibido no player

**Filtros**:
- **Obrigatórios**: Mapa e Ação
- **Opcionais**: Texto livre (processado como palavras-chave para busca em tags)

### 2. Gerenciamento de Vídeos (Admin)

**Processo**:
1. Administrador faz login no sistema
2. Acessa o dashboard administrativo
3. Faz upload de vídeo MP4 com metadados
4. Sistema salva arquivo no Firebase Storage
5. Metadados são salvos no Firestore
6. Vídeo fica disponível para busca

## Estrutura de Dados

### Modelo de Vídeo (Firestore)

Cada documento na coleção `videos` possui:

```typescript
{
  id: string;                    // ID único (gerado automaticamente)
  mapa: string;                  // Nome do mapa (ex: "mirage", "inferno")
  acao: string;                  // Tipo de ação (ex: "smoke", "flash")
  posicao_inicial: string;       // Posição inicial do jogador
  destino: string;               // Local de destino
  url_video: string;             // URL do vídeo no Storage
  tags: string[];                // Array de palavras-chave
  createdAt: Timestamp;          // Data de criação
}
```

### Sistema de Busca

A busca funciona em camadas:

1. **Filtros obrigatórios**: Reduzem o conjunto de dados por mapa e ação
2. **Filtro por tags**: Refina resultados quando texto é fornecido
3. **Limite**: Retorna apenas o primeiro resultado encontrado

**Vantagens**:
- Performance otimizada com filtros primários
- Precisão na busca por campos específicos
- Flexibilidade com texto opcional

## Componentes Principais

### Página Principal (`page.tsx`)

Interface dividida em dois painéis:
- **Painel Esquerdo (30%)**: Filtros de busca e controles
- **Painel Direito (70%)**: Visualização do vídeo

**Estados gerenciados**:
- Filtros de busca (mapa, ação, texto)
- Resultado da busca
- Estados de loading e erro

### API de Busca (`api/search/route.ts`)

Endpoint POST que processa requisições de busca:
- Valida dados de entrada
- Processa texto em palavras-chave
- Constrói query otimizada no Firestore
- Retorna resultado ou mensagem de erro

**Códigos de resposta**:
- `200`: Vídeo encontrado
- `400`: Dados inválidos
- `404`: Nenhum vídeo encontrado
- `500`: Erro interno do servidor

### Dashboard Administrativo

**Funcionalidades**:
- Upload de vídeos com barra de progresso
- Listagem de vídeos com paginação
- Edição de metadados
- Exclusão de vídeos (arquivo + registro)

**Proteção**:
- Autenticação obrigatória via Firebase Auth
- Redirecionamento automático para login se não autenticado

## Autenticação

O sistema utiliza Firebase Authentication para controle de acesso:

- **Login**: Email e senha no endpoint `/admin/login`
- **Proteção**: Rotas administrativas verificam autenticação
- **Sessão**: Mantida pelo Firebase até logout explícito

## Tratamento de Erros

O sistema trata os seguintes tipos de erro:

1. **Validação (400)**: Campos obrigatórios ausentes
2. **Não encontrado (404)**: Vídeo não existe com os critérios
3. **Servidor (500)**: Erro interno do sistema
4. **Rede**: Falha na comunicação com APIs

Todos os erros retornam mensagens claras ao usuário.

## Configuração

### Variáveis de Ambiente

Arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Nota**: O prefixo `NEXT_PUBLIC_` torna as variáveis acessíveis no frontend.

## Otimizações

### Performance
- Busca em camadas reduz volume de dados processados
- Índices compostos no Firestore para consultas rápidas
- Upload progressivo com feedback visual
- Carregamento sob demanda de componentes

### Segurança
- Validação de entrada em todas as requisições
- Autenticação obrigatória para operações administrativas
- Sanitização de dados antes de persistência

## Manutenção e Desenvolvimento

### Modificar Busca
- **Lógica**: `src/app/api/search/route.ts`
- **Interface**: `src/app/page.tsx`
- **Estilos**: `src/app/page.module.css`

### Adicionar Funcionalidades
1. Analisar código existente
2. Seguir padrões de nomenclatura
3. Testar localmente
4. Documentar alterações

## Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
