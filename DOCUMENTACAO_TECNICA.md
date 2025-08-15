# 📚 Documentação Técnica - CS2 Pixels (Atualizada)

## 🎯 Visão Geral do Sistema

Este documento explica **COMO** o sistema funciona tecnicamente após as atualizações, com exemplos práticos e explicações detalhadas para a equipe de desenvolvimento.

## 🔄 Fluxo Completo do Sistema Atualizado

### 1. Usuário Seleciona Filtros e Digita Texto

```
Usuário seleciona: Mapa = "Mirage", Ação = "Smoke"
Usuário digita: "base tr janela"
```

### 2. Processamento no Frontend (React)

```typescript
// 1. Os filtros são armazenados nos estados
setSelectedMap("mirage");
setSelectedAction("smoke");
setSearchTerm("base tr janela");

// 2. Quando o formulário é enviado, handleSearch() é chamada
const handleSearch = async (event) => {
  // 3. Faz requisição POST para /api/search com dados estruturados
  const response = await fetch('/api/search', {
    method: 'POST',
    body: JSON.stringify({
      mapa: "mirage",
      acao: "smoke", 
      textoBusca: "base tr janela"
    })
  });
};
```

### 3. Processamento na API (Next.js API Route)

```typescript
// 1. Recebe os dados estruturados
const { mapa, acao, textoBusca } = await req.json();

// 2. Valida filtros obrigatórios
if (!mapa || !acao) {
  return NextResponse.json(
    { error: 'Mapa e Ação são obrigatórios' },
    { status: 400 }
  );
}

// 3. Processa texto opcional em palavras-chave
const textKeywords = textoBusca
  .toLowerCase()                    // "base tr janela"
  .split(/\s+/)                     // ["base", "tr", "janela"]
  .filter((word) => word.length > 2); // ["base", "tr", "janela"]

// 4. Constrói consulta otimizada no Firestore
const queryConstraints = [
  where('mapa', '==', mapa.toLowerCase()),      // "mirage"
  where('acao', '==', acao.toLowerCase()),      // "smoke"
];

// 5. Adiciona busca por tags se houver texto
if (textKeywords.length > 0) {
  queryConstraints.push(where('tags', 'array-contains-any', textKeywords));
}

// 6. Monta query final
const q = query(collection(db, 'videos'), ...queryConstraints, limit(1));
```

### 4. Consulta Otimizada no Firestore

**Estrutura dos dados no Firestore:**
```json
{
  "mapa": "mirage",
  "posicao_inicial": "base tr",
  "acao": "smoke",
  "destino": "janela",
  "url_video": "https://firebasestorage.googleapis.com/...",
  "tags": ["mirage", "base", "tr", "smoke", "janela", "smokar"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Como a nova busca funciona:**
1. **Primeiro filtro**: `where('mapa', '==', 'mirage')` - encontra apenas vídeos do Mirage
2. **Segundo filtro**: `where('acao', '==', 'smoke')` - dentro dos vídeos do Mirage, encontra apenas smokes
3. **Terceiro filtro (opcional)**: `where('tags', 'array-contains-any', ["base", "tr", "janela"])` - refina ainda mais
4. **Resultado**: Vídeo que atende a TODOS os critérios

### 5. Resposta da API

```typescript
// Se encontrou um vídeo:
return NextResponse.json(videoData, { status: 200 });

// Se não encontrou:
return NextResponse.json(
  { message: 'Nenhum vídeo encontrado com esses critérios.' },
  { status: 404 }
);
```

### 6. Processamento no Frontend

```typescript
// 1. Recebe a resposta da API
const data = await response.json();

// 2. Atualiza o estado com o vídeo encontrado
setVideoResult(data);

// 3. React re-renderiza automaticamente e mostra o player de vídeo
```

## 🗄️ Estrutura do Banco de Dados (Firestore)

### Coleção: `videos`

Cada documento representa um vídeo com a seguinte estrutura:

```typescript
interface VideoDocument {
  // Identificadores
  id: string;                    // Gerado automaticamente pelo Firestore
  
  // Metadados do vídeo (Filtros obrigatórios)
  mapa: string;                  // Nome do mapa (ex: "mirage", "inferno", "dust2")
  acao: string;                  // Ação realizada (ex: "smoke", "flash", "molotov")
  
  // Metadados adicionais
  posicao_inicial: string;       // Posição inicial do jogador
  destino: string;               // Local de destino
  
  // Arquivo
  url_video: string;             // URL do vídeo no Firebase Storage
  
  // Sistema de busca refinado
  tags: string[];                // Array de palavras-chave para busca opcional
  
  // Metadados do sistema
  createdAt: Timestamp;          // Data de criação
  updatedAt?: Timestamp;         // Data da última atualização
}
```

### Exemplo de Documento Real

```json
{
  "id": "abc123def456",
  "mapa": "mirage",
  "acao": "smoke",
  "posicao_inicial": "base tr",
  "destino": "janela",
  "url_video": "https://firebasestorage.googleapis.com/v0/b/cs2-pixels.appspot.com/o/videos%2F1234567890-video.mp4?alt=media&token=abc123",
  "tags": ["mirage", "base", "tr", "smoke", "janela", "smokar", "fumaca"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🔍 Sistema de Busca Estruturado

### Como os Filtros São Processados

1. **Filtros Obrigatórios**:
   - `mapa`: Busca exata por nome do mapa
   - `acao`: Busca exata por tipo de ação

2. **Texto Opcional**:
   - Processado em palavras-chave
   - Aplicado como filtro adicional por tags
   - Refina os resultados dos filtros principais

### Estratégia de Busca em Camadas

```typescript
// CAMADA 1: Filtros obrigatórios (sempre aplicados)
const baseFilters = [
  where('mapa', '==', mapa.toLowerCase()),
  where('acao', '==', acao.toLowerCase()),
];

// CAMADA 2: Filtro opcional por tags (se houver texto)
let finalQuery = query(collection(db, 'videos'), ...baseFilters);

if (textKeywords.length > 0) {
  finalQuery = query(collection(db, 'videos'), ...baseFilters, 
    where('tags', 'array-contains-any', textKeywords)
  );
}

// CAMADA 3: Limite de resultados
finalQuery = query(finalQuery, limit(1));
```

### Vantagens da Nova Abordagem

1. **Performance**: Filtros obrigatórios reduzem drasticamente o conjunto de dados
2. **Precisão**: Busca por campos específicos é mais exata que busca por tags
3. **Flexibilidade**: Texto opcional permite refinamento quando necessário
4. **Escalabilidade**: Sistema funciona bem mesmo com muitos vídeos

## 🎨 Nova Interface Dividida

### Estrutura de Layout

```typescript
// src/app/page.tsx
return (
  <main className={styles.main}>
    <div className={styles.splitScreen}>
      
      {/* PAINEL ESQUERDO (30%): Controles */}
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelContent}>
          <h1>CS2 Pixels</h1>
          <p>Selecione o mapa, a ação e refine sua busca.</p>
          
          <form onSubmit={handleSearch} className={styles.searchHub}>
            {/* Dropdowns para filtros obrigatórios */}
            <select value={selectedMap} onChange={...}>
              <option value="mirage">Mirage</option>
              <option value="inferno">Inferno</option>
              {/* ... mais opções */}
            </select>
            
            <select value={selectedAction} onChange={...}>
              <option value="smoke">Smoke</option>
              <option value="flash">Flash</option>
              {/* ... mais opções */}
            </select>
            
            {/* Campo de texto opcional */}
            <div className={styles.searchInputContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={...}
                placeholder="Posição e destino..."
              />
              <button type="submit">Buscar</button>
            </div>
          </form>
        </div>
      </div>

      {/* PAINEL DIREITO (70%): Resultado do Vídeo */}
      <div className={styles.rightPanel}>
        <div className={styles.videoPlaceholder}>
          {/* Estados condicionais para loading, erro, vídeo */}
        </div>
      </div>
    </div>
  </main>
);
```

### Estados do Componente

```typescript
// Estados para filtros obrigatórios
const [selectedMap, setSelectedMap] = useState('mirage');
const [selectedAction, setSelectedAction] = useState('smoke');

// Estado para texto opcional
const [searchTerm, setSearchTerm] = useState('');

// Estados de resultado e controle
const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 🚀 Sistema de Upload (Dashboard Admin)

### Fluxo de Upload

1. **Seleção do arquivo**: Usuário escolhe um arquivo MP4
2. **Preenchimento de metadados**: Mapa, posição, ação, destino
3. **Geração de tags**: Sistema cria tags automaticamente baseado nos metadados
4. **Upload para Firebase Storage**: Arquivo é enviado com barra de progresso
5. **Salvamento no Firestore**: Metadados e URL são salvos no banco

### Código do Upload

```typescript
// 1. Cria referência no Storage
const storageRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`);

// 2. Inicia upload com progresso
const uploadTask = uploadBytesResumable(storageRef, videoFile);

// 3. Monitora progresso
uploadTask.on('state_changed',
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    setProgress(progress);
  },
  // ... tratamento de erro e sucesso
);

// 4. Quando termina, salva no Firestore
const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
const videoData = {
  mapa: mapa.toLowerCase(),
  acao: acao.toLowerCase(),
  posicao_inicial: posicao.toLowerCase(),
  destino: destino.toLowerCase(),
  url_video: downloadURL,
  tags: tagsArray,
  createdAt: serverTimestamp(),
};

await addDoc(collection(db, 'videos'), videoData);
```

## 🔐 Sistema de Autenticação

### Como Funciona

1. **Login**: Usuário digita email/senha no `/admin/login`
2. **Firebase Auth**: Valida credenciais e cria sessão
3. **Proteção de rotas**: `useAuthState` verifica se usuário está logado
4. **Redirecionamento**: Se não logado, vai para `/admin/login`

### Código de Proteção

```typescript
// Hook do Firebase para verificar estado da autenticação
const [user, loading] = useAuthState(auth);

// useEffect monitora mudanças na autenticação
useEffect(() => {
  if (!loading && !user) {
    router.push('/admin/login'); // Redireciona se não logado
  }
}, [user, loading, router]);
```

## 🎨 Sistema de Estilos (CSS Modules)

### Como Funciona

- Cada componente tem seu próprio arquivo `.module.css`
- Classes são únicas e não conflitam entre componentes
- Estilos são aplicados via `styles.nomeDaClasse`

### Exemplo para Nova Interface

```css
/* page.module.css */
.splitScreen {
  display: flex;
  height: 100vh;
  width: 100%;
}

.leftPanel {
  flex: 0 0 30%;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 2rem;
}

.rightPanel {
  flex: 0 0 70%;
  background: #ffffff;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.searchHub {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filterSelect {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.searchInputContainer {
  display: flex;
  gap: 0.5rem;
}

.searchInput {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.searchButton {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

## 🚨 Tratamento de Erros

### Tipos de Erro

1. **Erro de Validação (400)**: Filtros obrigatórios não fornecidos
2. **Erro de Busca (404)**: Vídeo não encontrado com os critérios
3. **Erro do Servidor (500)**: Problema interno no servidor
4. **Erro de Rede**: Falha na comunicação com a API

### Como São Tratados

```typescript
// Frontend: Estados específicos para cada tipo de erro
const [error, setError] = useState<string | null>(null);

// API: Status HTTP apropriados
if (!mapa || !acao) {
  return NextResponse.json(
    { error: 'Mapa e Ação são obrigatórios' },
    { status: 400 }
  );
}

// Tratamento no frontend
try {
  const response = await fetch('/api/search', { /* ... */ });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
} catch (err) {
  setError(err.message);
}
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env.local)

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cs2-pixels.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cs2-pixels
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cs2-pixels.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Por que NEXT_PUBLIC_?

- Variáveis com prefixo `NEXT_PUBLIC_` são acessíveis no frontend
- Variáveis sem prefixo só são acessíveis no servidor
- Como o Firebase é usado tanto no frontend quanto no backend, precisamos do prefixo

## 📱 Responsividade e UX

### Design Responsivo

- **Mobile First**: Interface otimizada para dispositivos móveis
- **CSS Grid/Flexbox**: Layout adaptável a diferentes tamanhos de tela
- **Media Queries**: Ajustes específicos para diferentes breakpoints

### Experiência do Usuário

- **Feedback visual**: Loading states, mensagens de erro/sucesso
- **Validação em tempo real**: Filtros obrigatórios sempre preenchidos
- **Progresso**: Barra de progresso para uploads
- **Navegação intuitiva**: Interface dividida clara e organizada

## 🚀 Otimizações Implementadas

### Performance

1. **Busca em camadas**: Filtros obrigatórios primeiro, tags opcionais depois
2. **Índices otimizados**: Firestore pode criar índices compostos para mapa+acao
3. **Upload progressivo**: Usuário vê o progresso do upload
4. **Lazy loading**: Componentes carregam apenas quando necessário

### Segurança

1. **Validação de entrada**: Todos os dados são validados antes do processamento
2. **Autenticação**: Apenas usuários autorizados acessam o dashboard
3. **Sanitização**: Dados são processados antes de salvar no banco

## 🔄 Fluxo de Desenvolvimento

### Para Adicionar Novas Funcionalidades

1. **Entenda o código existente** (leia esta documentação)
2. **Crie um branch** para sua feature
3. **Siga os padrões** de nomenclatura e estrutura
4. **Teste localmente** antes de commitar
5. **Documente mudanças** importantes

### Para Modificar a Busca

- **Algoritmo**: Edite `src/app/api/search/route.ts`
- **Interface**: Modifique `src/app/page.tsx`
- **Estilos**: Ajuste `src/app/page.module.css`

### Para Alterar a Interface

- **Layout**: Modifique a estrutura de painéis em `src/app/page.tsx`
- **Filtros**: Ajuste os dropdowns e campos de entrada
- **Estilos**: Modifique os arquivos `.module.css`

## 📚 Recursos Adicionais

### Documentação das Tecnologias

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Firebase**: https://firebase.google.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### Ferramentas de Desenvolvimento

- **VS Code**: Editor recomendado com extensões para React/TypeScript
- **React DevTools**: Extensão do navegador para debug
- **Firebase Console**: Interface web para gerenciar o projeto

---

**Esta documentação foi atualizada para refletir as mudanças no sistema de busca. Mantenha-a sempre atualizada com novas modificações.**


