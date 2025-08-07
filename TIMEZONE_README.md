# Sistema de Timezone - Posts

Este documento explica como as datas dos posts estão sendo tratadas no sistema para garantir que sejam salvas em UTC no banco de dados e exibidas no timezone local do usuário.

## ✅ Situação Atual (Corrigida)

### Backend (Laravel)
- **Timezone configurado**: UTC (padrão correto)
- **Salvamento**: Todas as datas são salvas em UTC no banco de dados
- **API Response**: Datas retornadas em formato ISO 8601 com timezone explícito (`2025-08-07T20:50:36.000000Z`)

### Frontend (Next.js)
- **Recebimento**: Datas recebidas da API em formato ISO com timezone UTC
- **Exibição**: Datas formatadas automaticamente para o timezone local do usuário
- **Envio**: Datas enviadas para a API em formato ISO UTC
- **Seleção**: Interface permite selecionar data e horário separadamente
- **Horário padrão**: Ao selecionar uma data, usa horário atual como padrão (não mais 00:00)

## 🔧 Configurações Implementadas

### 1. Backend - PostResource.php
```php
'published_at' => optional($this->published_at)->toISOString(),
'created_at' => $this->created_at->toISOString(),
'updated_at' => $this->updated_at->toISOString(),
```
- Utiliza `toISOString()` para garantir formato ISO com timezone explícito
- Formato: `2025-08-07T20:50:36.000000Z` (Z indica UTC)

### 2. Frontend - date-format.ts
```typescript
// Garante parsing correto de datas do backend
export const formatDatePtBr = (date: string | Date, formatStr = "dd/MM/yyyy") => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, formatStr, { locale: ptBR });
};
```

### 3. Frontend - posts.ts
```typescript
// Envia datas em formato ISO UTC para a API
const formatDateForAPI = (date: Date): string => {
  return date.toISOString();
};
```

### 4. Frontend - upsert-post.tsx (Seletor de Data e Hora)
```typescript
// Ao selecionar uma data, preserva o horário existente ou usa o atual
const handleDateSelect = (selectedDate: Date | undefined) => {
  if (field.value) {
    // Preserva horário existente
    selectedDate.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
  } else {
    // Usa horário atual como padrão
    const now = new Date();
    selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
  }
};
```

**Recursos do Seletor:**
- ✅ Calendário para seleção de data
- ✅ Campo de horário (type="time") para precisão
- ✅ Botão "Agora" para usar horário atual
- ✅ Botão "Limpar" para remover data/hora
- ✅ Preservação de horário ao trocar datas
- ✅ Horário atual como padrão (não mais 00:00)

## 🧪 Como Testar

### 1. Teste de Salvamento (Backend)
```php
php artisan tinker
$post = App\Models\Post::create([
    'title' => 'Teste Timezone',
    'content' => 'Conteúdo',
    'author' => 'Teste',
    'status' => 'published',
    'published_at' => now()
]);

echo 'Data no banco: ' . $post->getRawOriginal('published_at') . PHP_EOL;
echo 'Data via API: ' . $post->published_at->toISOString() . PHP_EOL;
```

### 2. Teste de Exibição (Frontend)
1. Crie um post no frontend com uma data específica
2. Verifique se aparece formatada corretamente na tabela
3. A data deve aparecer no timezone local do usuário

### 3. Verificação no Banco
```bash
sqlite3 database/database.sqlite "SELECT published_at FROM posts LIMIT 5;"
```
- Todas as datas devem estar em formato UTC: `2025-08-07 20:50:36`

## 🌍 Comportamento por Timezone

### Usuário em São Paulo (GMT-3)
- **Cria post às 15:00 local** → Salvo como `18:00 UTC` no banco
- **Visualiza post** → Mostra `15:00` (convertido automaticamente)

### Usuário em Lisboa (GMT+0)
- **Visualiza o mesmo post** → Mostra `18:00` (seu timezone local)

### Usuário em Tóquio (GMT+9)
- **Visualiza o mesmo post** → Mostra `03:00 do dia seguinte` (seu timezone local)

## 📝 Fluxo Completo

1. **Criação no Frontend**:
   - Usuário seleciona data no calendar (timezone local)
   - `toISOString()` converte para UTC antes do envio
   - Exemplo: `2025-08-07T18:00:00.000Z`

2. **Salvamento no Backend**:
   - Laravel recebe a string ISO
   - Carbon converte automaticamente para UTC
   - Salva no banco: `2025-08-07 18:00:00`

3. **Listagem no Frontend**:
   - Backend retorna: `2025-08-07T18:00:00.000000Z`
   - date-fns converte automaticamente para timezone local
   - Usuário vê a data em seu timezone

## 🚨 Importante

- **Nunca altere o timezone do Laravel** de UTC
- **Sempre use toISOString()** ao enviar datas para a API
- **As funções de formatação** fazem a conversão automática
- **O browser detecta automaticamente** o timezone do usuário

## 📊 Logs de Teste

```
Post criado ID: 52
Data no banco (raw): 2025-08-07 20:50:36
Data via Resource: 2025-08-07T20:50:36.000000Z
```

✅ **Sistema funcionando corretamente!**
