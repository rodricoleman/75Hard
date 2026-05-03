# Rotina

App pessoal de rotina com economia interna: hábitos geram coin, anti-hábitos drenam coin, e a "loja" só libera recompensas (gastos reais) se você tiver coin pra bancar.

## Stack

- **Expo SDK 51** + Expo Router (iOS, Android, Web do mesmo código)
- **Supabase** (auth, Postgres, RLS) — todo o banco com policies por usuário
- **TypeScript**, **Zustand** (estado), **date-fns**
- **expo-notifications** pra lembrete diário local

## Setup

### 1. Instalar deps

```bash
npm install
```

### 2. Criar projeto Supabase

1. Cria projeto em https://supabase.com
2. Pega `Project URL` e `anon key` em Settings → API
3. Cria `.env.local` na raiz:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Rodar migration

Aplique `supabase/migrations/0001_init.sql` no SQL editor do Supabase. Cria:

- `profile` (saldo coin, xp, nível)
- `habit`, `habit_completion`
- `anti_habit`, `anti_habit_log`
- `reward`, `redemption`
- `wallet_entry` (audit log de toda mudança em coin/xp)
- RPCs `complete_habit`, `uncomplete_habit`, `log_anti_habit`, `redeem_reward`, `apply_delta`
- Trigger que cria perfil + auto-confirma email no signup

### 4. Rodar

```bash
npm run web      # web
npm run ios      # iOS (precisa de Mac + Xcode)
npm start        # menu (Expo Go pra testar no celular)
```

## Como funciona

### Economia

- **Coin** = moeda gastável. Sobe com hábitos cumpridos, cai com anti-hábitos e resgates.
- **XP** = progresso permanente, nunca desce. Define o **nível** (`level = 1 + floor(sqrt(xp / 50))`).
- **Streak multiplica**: 3 dias = 1.25x, 7d = 1.5x, 14d = 1.75x, 30d+ = 2x. Aplica em coin e xp.
- **Dificuldade** define payout base: easy 5, medium 10, hard 20, brutal 40.

### Anti-hábitos

Toque pra registrar uma slip. Perde `coin_penalty` × `count`. Sem regra automática — depende de você ser honesto.

### Recompensas

Cadastra o que você quer comprar com coin (hambúrguer, jogo, viagem). Tipos:
- **Consumível**: pequeno e recorrente (cafezinho, doce)
- **Único**: gasto pontual médio
- **Grande**: requer poupança (viagem, móvel)

Resgatar debita coin do saldo. App não bloqueia compra real — é honor system.

### Notificações

Em Ajustes → ativa lembrete diário num horário (push local no iOS, web só com a aba aberta).

## Estrutura

```
app/                  Expo Router (telas)
  (auth)/login.tsx
  (tabs)/             Hoje, Hábitos, Loja, Stats, Ajustes
  habit/              new.tsx, [id].tsx
  anti/               new.tsx, [id].tsx
  reward/             new.tsx, [id].tsx
components/           UI compartilhada
lib/                  supabase, economy, dates, streak, notifications, haptics
store/                Zustand stores
supabase/migrations/  SQL
theme/                colors, tokens
types/                tipos compartilhados
```

## Próximos passos (não implementado ainda)

- Missões temporárias com payout extra
- Bosses semanais (meta agregada)
- Histórico de transações na UI (já existe em `wallet_entry`)
- Bloqueio de apps via Screen Time / Digital Wellbeing
- Sincronização de horário de lembrete via cron remoto
