# 🚀 Guia Rápido - CS2 Pixels (Atualizado)

## ⚡ Comandos Essenciais

### Desenvolvimento
```bash
npm install          # Instala dependências
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run lint         # Verifica qualidade do código
```

### Acesso
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login
- **Dashboard**: http://localhost:3000/admin/dashboard

## 🔑 Configuração Rápida

### 1. Clone e Instale
```bash
git clone [URL_DO_REPOSITORIO]
cd cs2-pixels
npm install
```

### 2. Configure o Firebase
Crie `.env.local` na raiz:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 3. Execute
```bash
npm run dev
```

## 📁 Estrutura Rápida

```
src/
├── app/
│   ├── page.tsx              # Página principal (sistema de busca)
│   ├── api/search/route.ts   # API de busca otimizada
│   └── admin/                # Área administrativa
│       ├── login/page.tsx    # Login
│       └── dashboard/page.tsx # Dashboard
└── lib/
    └── firebase.ts           # Configuração Firebase
```

## 🔍 Como Testar o Novo Sistema de Busca

### 1. Adicione um Vídeo via Dashboard
- Acesse `/admin/dashboard`
- Faça login com credenciais válidas
- Upload de um vídeo MP4
- Preencha: mapa, posição, ação, destino
- Adicione tags relevantes

### 2. Teste a Busca Estruturada
- Vá para a página principal
- **Selecione o mapa** (ex: Mirage)
- **Selecione a ação** (ex: Smoke)
- **Digite texto opcional** (ex: "base tr janela")
- Clique em buscar

## 🛠️ Desenvolvimento Rápido

### Para Modificar a Busca
```typescript
// src/app/api/search/route.ts
// Adicione novos filtros obrigatórios
const queryConstraints = [
  where('mapa', '==', mapa.toLowerCase()),
  where('acao', '==', acao.toLowerCase()),
  // Adicione novos filtros aqui
  where('novo_campo', '==', novoValor),
];
```

### Para Adicionar Novos Filtros
```typescript
// 1. Adicione na interface
interface VideoResult {
  novo_filtro: string;
}

// 2. Atualize o frontend
const [selectedNovoFiltro, setSelectedNovoFiltro] = useState('');

// 3. Adicione no formulário
<select value={selectedNovoFiltro} onChange={...}>
  <option value="opcao1">Opção 1</option>
  <option value="opcao2">Opção 2</option>
</select>

// 4. Envie para a API
body: JSON.stringify({
  mapa: selectedMap,
  acao: selectedAction,
  novo_filtro: selectedNovoFiltro,
  textoBusca: searchTerm,
})
```

### Para Modificar a Interface
```typescript
// src/app/page.tsx
// Altere a proporção dos painéis
<div className={styles.splitScreen}>
  <div className={styles.leftPanel}>  {/* Controles */}
    {/* Seu conteúdo aqui */}
  </div>
  <div className={styles.rightPanel}> {/* Vídeo */}
    {/* Seu conteúdo aqui */}
  </div>
</div>
```

## 🎨 Estilos (CSS Modules)

### Adicionar Nova Classe
```css
/* page.module.css */
.novaClasse {
  color: blue;
  font-size: 18px;
}
```

### Usar no Componente
```typescript
import styles from './page.module.css';

return (
  <div className={styles.novaClasse}>
    Texto azul
  </div>
);
```

### Layout de Painéis
```css
/* page.module.css */
.splitScreen {
  display: flex;
  height: 100vh;
  width: 100%;
}

.leftPanel {
  flex: 0 0 30%;  /* 30% da largura */
  background: #f8fafc;
}

.rightPanel {
  flex: 0 0 70%;  /* 70% da largura */
  background: #ffffff;
}
```

## 🔐 Autenticação

### Verificar se Usuário Está Logado
```typescript
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

const [user, loading] = useAuthState(auth);

if (loading) return <p>Carregando...</p>;
if (!user) return <p>Faça login</p>;
```

### Proteger Rota
```typescript
useEffect(() => {
  if (!loading && !user) {
    router.push('/admin/login');
  }
}, [user, loading, router]);
```

## 🗄️ Firestore

### Estrutura da Coleção `videos`
```typescript
{
  mapa: "mirage",           // Filtro obrigatório
  acao: "smoke",            // Filtro obrigatório
  posicao_inicial: "base tr",
  destino: "janela",
  url_video: "https://...",
  tags: ["mirage", "base", "tr", "smoke", "janela"],
  createdAt: Timestamp
}
```

### Nova Consulta de Busca
```typescript
// Busca em camadas
const queryConstraints = [
  where('mapa', '==', mapa.toLowerCase()),      // Filtro obrigatório
  where('acao', '==', acao.toLowerCase()),      // Filtro obrigatório
];

// Filtro opcional por tags
if (textKeywords.length > 0) {
  queryConstraints.push(where('tags', 'array-contains-any', textKeywords));
}

const q = query(collection(db, 'videos'), ...queryConstraints, limit(1));
```

## 🚨 Erros Comuns

### "Firebase not initialized"
- Verifique se `.env.local` existe
- Confirme se as credenciais estão corretas
- Reinicie o servidor após mudanças no `.env.local`

### "Collection not found"
- Verifique se a coleção `videos` existe no Firestore
- Confirme se o projeto Firebase está correto

### "Permission denied"
- Verifique as regras de segurança do Firestore
- Confirme se o usuário está autenticado

### "Mapa e Ação são obrigatórios"
- Verifique se os dropdowns estão sendo preenchidos
- Confirme se os valores estão sendo enviados para a API

## 📱 Responsividade

### Breakpoints Recomendados
```css
/* Mobile First */
.splitScreen {
  flex-direction: column;
}

.leftPanel, .rightPanel {
  flex: 0 0 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .splitScreen {
    flex-direction: row;
  }
  
  .leftPanel {
    flex: 0 0 30%;
  }
  
  .rightPanel {
    flex: 0 0 70%;
  }
}
```

## 🔄 Git Workflow

### 1. Criar Branch
```bash
git checkout -b feature/novo-filtro
```

### 2. Desenvolver
```bash
# Faça suas mudanças
npm run dev  # Teste localmente
npm run lint # Verifique qualidade
```

### 3. Commit
```bash
git add .
git commit -m "feat: adiciona novo filtro de busca"
```

### 4. Push e Pull Request
```bash
git push origin feature/novo-filtro
# Crie PR no GitHub/GitLab
```

## 📚 Recursos Úteis

### Documentação
- **README.md** - Visão geral do projeto
- **DOCUMENTACAO_TECNICA.md** - Explicações técnicas detalhadas
- **GUIA_RAPIDO.md** - Este arquivo

### Links Externos
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Ferramentas
- **VS Code** com extensões React/TypeScript
- **React DevTools** no navegador
- **Firebase Console** para gerenciar dados

## 🆘 Precisa de Ajuda?

### 1. Verifique a Documentação
- Leia este guia
- Consulte a documentação técnica
- Verifique o README

### 2. Analise o Código
- Use `console.log()` para debug
- Verifique o console do navegador
- Use React DevTools

### 3. Peça Ajuda
- Discuta com a equipe
- Compartilhe o erro específico
- Mostre o código relevante

## 🔧 Dicas para o Novo Sistema

### 1. Entenda a Estrutura de Filtros
- **Mapa e Ação** são sempre obrigatórios
- **Texto** é opcional e refina a busca
- A busca funciona em camadas para melhor performance

### 2. Para Adicionar Novos Filtros
- Adicione no frontend (dropdown/input)
- Atualize a interface TypeScript
- Modifique a API para receber o novo campo
- Ajuste a query do Firestore

### 3. Para Modificar o Layout
- O sistema usa `flexbox` para dividir a tela
- `leftPanel` (30%) e `rightPanel` (70%)
- Use CSS Modules para estilos específicos

---

**💡 Dica: O novo sistema é mais estruturado e performático. Teste sempre os filtros obrigatórios primeiro!**


