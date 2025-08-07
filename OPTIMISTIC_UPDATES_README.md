# 🚀 Optimistic Updates com React Query - Implementado

Este documento descreve a implementação completa de optimistic updates para os posts usando React Query, incluindo indicadores visuais e notificações toast.

## ✅ Funcionalidades Implementadas

### 🎯 Optimistic Updates
- **Criação de Posts**: Novo post aparece instantaneamente no topo da lista
- **Edição de Posts**: Atualizações refletidas imediatamente  
- **Exclusão de Posts**: Item removido da lista instantaneamente
- **Reversão em caso de erro**: Cache volta ao estado anterior se a operação falhar

### 🎨 Indicadores Visuais
- **Posts pendentes**: Linha com fundo diferenciado (`bg-muted/30`)
- **Animação**: Efeito `animate-pulse` durante criação
- **ID temporário**: Mostra "Criando..." no campo ID
- **Texto diferenciado**: Título com "(criando...)" e texto esmaecido

### 🔔 Notificações Toast
- **Sucesso**: Toast verde com mensagem de confirmação
- **Erro**: Toast vermelho com descrição do problema
- **Warning**: Toast amarelo para ações não permitidas (ex: deletar post pendente)

### 🛡️ Proteções
- **Posts pendentes**: Não podem ser editados ou deletados
- **Reversão de erro**: Cache revertido automaticamente em falhas
- **Loading states**: Modal mostra estado de carregamento durante operações

## 🔧 Implementação Técnica

### 1. Mutations com React Query

```typescript
// Mutation para criar post com optimistic update
const createPostMutation = useMutation({
  mutationFn: createPost,
  onMutate: async (newPost) => {
    // Cancelar queries para evitar conflitos
    await queryClient.cancelQueries({ queryKey: ["posts", queryParams] });
    
    // Snapshot dos dados atuais
    const previousPosts = queryClient.getQueryData(["posts", queryParams]);
    
    // Post temporário com ID negativo
    const tempPost: Post = {
      id: -Date.now(),
      ...newPost,
      _isPending: true
    };
    
    // Update optimista do cache
    queryClient.setQueryData(["posts", queryParams], (old: any) => ({
      ...old,
      posts: [tempPost, ...old.posts],
      total: old.total + 1
    }));
    
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    // Reverter em caso de erro
    queryClient.setQueryData(["posts", queryParams], context.previousPosts);
    toast.error("❌ Erro ao criar post");
  },
  onSuccess: (data) => {
    toast.success("✅ Post criado com sucesso!");
  },
  onSettled: () => {
    // Sempre invalidar no final
    queryClient.invalidateQueries({ queryKey: ["posts", queryParams] });
  }
});
```

### 2. Indicadores Visuais

```typescript
// Tipo Post com propriedade de pending
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  _isPending?: boolean; // ← Nova propriedade
}

// Estilos condicionais na tabela
<TableRow className={post._isPending ? "bg-muted/30 animate-pulse" : ""}>

// ID temporário
<span>{post.id < 0 ? "Criando..." : post.id}</span>

// Título com indicador
<div className={post._isPending && "text-muted-foreground italic opacity-75"}>
  {post.title} {post._isPending && "(criando...)"}
</div>
```

### 3. Sistema de Toast

```typescript
import { toast } from "sonner";

// Toast de sucesso
toast.success("✅ Post criado com sucesso!", {
  description: `O post "${data.title}" foi criado.`
});

// Toast de erro
toast.error("❌ Erro ao criar post", {
  description: "Não foi possível criar o post. Tente novamente."
});

// Toast de warning
toast.warning("⏳ Post ainda está sendo criado", {
  description: "Aguarde a conclusão antes de tentar deletar."
});
```

### 4. Proteções Implementadas

```typescript
const handleDeletePost = async (post: Post) => {
  // Bloquear ações em posts pendentes
  if (post.id < 0) {
    toast.warning("⏳ Post ainda está sendo criado");
    return;
  }
  
  const confirmed = window.confirm(`Deletar "${post.title}"?`);
  if (confirmed) {
    deletePostMutation.mutate(post.id);
  }
};
```

## 🎬 Fluxo de Operação

### Criação de Post:
1. **Usuário clica "Create Post"** → Modal abre
2. **Preenche dados e submete** → Modal fecha, post aparece no topo
3. **Post pendente visível** → Linha com fundo diferenciado e "Criando..."
4. **Requisição completa** → Post atualizado com ID real, toast de sucesso
5. **Em caso de erro** → Post removido, toast de erro

### Edição de Post:
1. **Usuário clica "Edit"** → Modal abre com dados
2. **Modifica e submete** → Atualização imediata
3. **Toast de confirmação** → "Post atualizado com sucesso!"

### Exclusão de Post:
1. **Usuário clica "Delete"** → Confirmação
2. **Post removido** → Lista atualizada instantaneamente
3. **Toast de sucesso** → "Post deletado com sucesso!"

## 🧪 Cenários de Teste

### ✅ Cenários Positivos:
- Criar post com dados válidos
- Editar post existente
- Deletar post confirmando
- Múltiplas operações simultâneas

### ❌ Cenários de Erro:
- Falha na API durante criação
- Erro de rede durante edição
- Tentativa de deletar post pendente
- Cancelamento de operações

### 🔄 Recovery:
- Cache revertido automaticamente
- Toast de erro informativo
- Interface permanece responsiva

## 🚨 Importante

- **IDs negativos** são reservados para posts pendentes
- **_isPending** é uma propriedade temporária, não enviada para API
- **Toast** funciona automaticamente com o componente Toaster no layout
- **Cache** é invalidado após cada operação para garantir consistência

## 📈 Melhorias Futuras

- [ ] Indicador de progresso mais sofisticado
- [ ] Retry automático em falhas de rede
- [ ] Batch operations para múltiplas operações
- [ ] Undo/Redo para operações críticas
- [ ] Sincronização em tempo real (websockets)

---

✨ **Sistema de optimistic updates totalmente implementado e funcional!**
