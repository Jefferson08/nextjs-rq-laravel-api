# API Structure Documentation

Esta pasta contém toda a lógica de comunicação com a API backend Laravel.

## 📁 Estrutura

```
lib/api/
├── client.ts      # Configuração do axios com interceptors
├── types.ts       # Tipos TypeScript para API
├── posts.ts       # Serviço específico para Posts
├── index.ts       # Exports centralizados
└── README.md      # Esta documentação
```

## 🔧 Configuração

### client.ts
- Configuração base do axios
- Interceptors para request/response
- Tratamento de erros centralizado
- URL base puxada do `.env` (`NEXT_PUBLIC_API_URL`)

### types.ts
- Tipos TypeScript para todas as entidades
- Interfaces para requests/responses
- Tipos para paginação do Laravel
- Tipos para tratamento de erros

## 📦 Serviços

### postsService
Todas as operações CRUD para Posts:

```typescript
// Listar posts
const posts = await getPosts({ page: 1, per_page: 10 });

// Buscar post específico
const post = await getPost(1);

// Criar post
const newPost = await createPost({
  title: "My Post",
  content: "Content here...",
  author: "John Doe",
  status: "draft"
});

// Atualizar post
const updatedPost = await updatePost(1, {
  title: "Updated Title"
});

// Deletar post
await deletePost(1);
```

## 🚀 Como usar

### Import Simples
```typescript
import { getPosts, createPost } from '@/lib/api';
```

### Import do Serviço Completo
```typescript
import { postsService } from '@/lib/api';

const posts = await postsService.getPosts();
```

### Com React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPosts, createPost } from '@/lib/api';

// Query
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => getPosts()
});

// Mutation
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    // Invalidar queries relacionadas
  }
});
```

## 🔐 Autenticação

Para adicionar autenticação no futuro, edite o interceptor em `client.ts`:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🛠 Adicionando Novos Serviços

1. Criar arquivo `lib/api/[service].ts`
2. Definir tipos em `types.ts`
3. Exportar em `index.ts`

Exemplo para Users:

```typescript
// lib/api/users.ts
export const usersService = {
  async getUsers() { /* ... */ },
  async createUser() { /* ... */ },
};

// lib/api/index.ts
export { usersService } from './users';
```

## 📋 Environment Variables

Certifique-se de configurar as variáveis de ambiente:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔄 Tratamento de Erros

A API já trata automaticamente:
- Erros de rede
- Timeouts
- Respostas HTTP de erro
- Validação do Laravel (422)
- Autenticação (401)

Os erros são padronizados no formato:
```typescript
{
  status: number;
  message: string;
  errors: Record<string, string[]> | null;
}
```
