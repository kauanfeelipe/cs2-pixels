# 📚 Documentação Técnica - CS2 Pixels

## 🎯 Visão Geral do Sistema

Este documento explica **COMO** o sistema funciona tecnicamente, com exemplos práticos e explicações detalhadas para a equipe de desenvolvimento.

## 🔄 Fluxo Completo do Sistema

### 1. Usuário Faz uma Busca

```
Usuário digita: "Mirage base TR smokar janela"
```

### 2. Processamento no Frontend (React)

```typescript
// 1. O texto é armazenado no estado
setSearchTerm("Mirage base TR smokar janela");

// 2. Quando o formulário é enviado, handleSearch() é chamada
const handleSearch = async (event) => {
  // 3. Faz requisição POST para /api/search
  const response = await fetch('/api/search', {
    method: 'POST',
    body: JSON.stringify({ searchTerm: "Mirage base TR smokar janela" })
  });
};
```

### 3. Processamento na API (Next.js API Route)

```typescript
// 1. Recebe o texto: "Mirage base TR smokar janela"
const { searchTerm } = await req.json();

// 2. Processa o texto em palavras-chave
const keywords = searchTerm
  .toLowerCase()                    // "mirage base tr smokar janela"
  .split(/\s+/)                     // ["mirage", "base", "tr", "smokar", "janela"]
  .filter((word) => word.length > 2); // ["mirage", "base", "tr", "smokar", "janela"]

// 3. Busca no Firestore
const q = query(
  collection(db, 'videos'),
  where('tags', 'array-contains-any', ["mirage", "base", "tr", "smokar", "janela"]),
  limit(1)
);
```

### 4. Consulta no Firestore

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

**Como a busca funciona:**
- `array-contains-any` significa: "encontre documentos onde o array 'tags' contenha QUALQUER uma das palavras-chave"
- Se pelo menos uma palavra-chave for encontrada, o documento é retornado
- `limit(1)` retorna apenas o primeiro resultado encontrado

### 5. Resposta da API

```typescript
// Se encontrou um vídeo:
return NextResponse.json(videoData, { status: 200 });

// Se não encontrou:
return NextResponse.json(
  { message: 'Nenhum vídeo encontrado.' },
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
  
  // Metadados do vídeo
  mapa: string;                  // Nome do mapa (ex: "mirage", "inferno", "dust2")
  posicao_inicial: string;       // Posição inicial do jogador
  acao: string;                  // Ação realizada
  destino: string;               // Local de destino
  
  // Arquivo
  url_video: string;             // URL do vídeo no Firebase Storage
  
  // Sistema de busca
  tags: string[];                // Array de palavras-chave para busca
  
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
  "posicao_inicial": "base tr",
  "acao": "smoke",
  "destino": "janela",
  "url_video": "https://firebasestorage.googleapis.com/v0/b/cs2-pixels.appspot.com/o/videos%2F1234567890-video.mp4?alt=media&token=abc123",
  "tags": ["mirage", "base", "tr", "smoke", "janela", "smokar", "fumaca"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 🔍 Sistema de Busca Inteligente

### Como as Tags São Processadas

1. **Entrada do usuário**: "Mirage base TR smokar janela"
2. **Processamento**:
   - Converte para minúsculas: "mirage base tr smokar janela"
   - Divide por espaços: ["mirage", "base", "tr", "smokar", "janela"]
   - Remove palavras pequenas: ["mirage", "base", "tr", "smokar", "janela"]
3. **Busca no Firestore**: `array-contains-any` com essas palavras-chave

### Estratégia de Tags

**Tags devem incluir:**
- **Sinônimos**: "smoke" e "smokar" para a mesma ação
- **Variações**: "base tr", "base terrorist", "terrorist base"
- **Abreviações**: "tr" para "terrorist", "ct" para "counter-terrorist"
- **Termos relacionados**: "fumaca" para "smoke"

**Exemplo de tags para um vídeo:**
```typescript
tags: [
  "mirage",           // Nome do mapa
  "base",             // Posição geral
  "tr",               // Abreviação
  "terrorist",        // Nome completo
  "smoke",            // Ação em inglês
  "smokar",           // Ação em português
  "fumaca",           // Sinônimo
  "janela",           // Destino
  "window"            // Destino em inglês
]
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

### Exemplo

```css
/* dashboard.module.css */
.panel {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.buttonPrimary {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

```typescript
// No componente React
import styles from './dashboard.module.css';

return (
  <div className={styles.panel}>
    <button className={styles.buttonPrimary}>
      Adicionar Vídeo
    </button>
  </div>
);
```

## 🚨 Tratamento de Erros

### Tipos de Erro

1. **Erro de Validação (400)**: Dados inválidos enviados pelo usuário
2. **Erro de Busca (404)**: Vídeo não encontrado
3. **Erro do Servidor (500)**: Problema interno no servidor
4. **Erro de Rede**: Falha na comunicação com a API

### Como São Tratados

```typescript
// Frontend: Estados específicos para cada tipo de erro
const [error, setError] = useState<string | null>(null);

// API: Status HTTP apropriados
if (!searchTerm) {
  return NextResponse.json(
    { error: 'Termo de busca é obrigatório' },
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
- **Validação em tempo real**: Botões desabilitados quando apropriado
- **Progresso**: Barra de progresso para uploads
- **Navegação intuitiva**: Links claros e botões bem posicionados

## 🚀 Otimizações Implementadas

### Performance

1. **Limit de resultados**: `limit(1)` na busca para retornar apenas o necessário
2. **Upload progressivo**: Usuário vê o progresso do upload
3. **Lazy loading**: Componentes carregam apenas quando necessário

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

### Para Alterar o Dashboard

- **Funcionalidades**: Edite `src/app/admin/dashboard/page.tsx`
- **Estilos**: Modifique `src/app/admin/dashboard/dashboard.module.css`
- **Validações**: Ajuste as validações no formulário

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

**Esta documentação deve ser atualizada sempre que houver mudanças significativas no código.**
