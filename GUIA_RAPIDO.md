# 🚀 Guia Rápido - CS2 Pixels

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
│   ├── page.tsx              # Página principal (busca)
│   ├── api/search/route.ts   # API de busca
│   └── admin/                # Área administrativa
│       ├── login/page.tsx    # Login
│       └── dashboard/page.tsx # Dashboard
└── lib/
    └── firebase.ts           # Configuração Firebase
```

## 🔍 Como Testar a Busca

### 1. Adicione um Vídeo via Dashboard
- Acesse `/admin/dashboard`
- Faça login com credenciais válidas
- Upload de um vídeo MP4
- Preencha: mapa, posição, ação, destino
- Adicione tags relevantes

### 2. Teste a Busca
- Vá para a página principal
- Digite termos relacionados às tags do vídeo
- Ex: "mirage base tr smoke" se o vídeo tiver essas tags

## 🛠️ Desenvolvimento Rápido

### Para Modificar a Busca
```typescript
// src/app/api/search/route.ts
const keywords = searchTerm
  .toLowerCase()
  .split(/\s+/)                     // Divide por espaços
  .filter((word) => word.length > 2); // Remove palavras pequenas
```

### Para Adicionar Novos Campos
```typescript
// 1. Adicione na interface
interface VideoResult {
  novo_campo: string;
}

// 2. Atualize o dashboard
const [novoCampo, setNovoCampo] = useState('');

// 3. Salve no Firestore
const videoData = {
  novo_campo: novoCampo,
  // ... outros campos
};
```

### Para Modificar a Interface
```typescript
// src/app/page.tsx
return (
  <div className={styles.container}>
    {/* Seu novo conteúdo aqui */}
  </div>
);
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
  mapa: "mirage",
  posicao_inicial: "base tr",
  acao: "smoke",
  destino: "janela",
  url_video: "https://...",
  tags: ["mirage", "base", "tr", "smoke", "janela"],
  createdAt: Timestamp
}
```

### Consulta de Busca
```typescript
const q = query(
  collection(db, 'videos'),
  where('tags', 'array-contains-any', keywords),
  limit(1)
);
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

## 📱 Responsividade

### Breakpoints Recomendados
```css
/* Mobile First */
.container { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
  .container { width: 80%; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { width: 60%; }
}
```

## 🔄 Git Workflow

### 1. Criar Branch
```bash
git checkout -b feature/nova-funcionalidade
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
git commit -m "feat: adiciona nova funcionalidade de busca"
```

### 4. Push e Pull Request
```bash
git push origin feature/nova-funcionalidade
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

---

**💡 Dica: Sempre teste suas mudanças localmente antes de commitar!**
