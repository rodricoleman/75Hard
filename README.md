# 75Hard

App minimalista para acompanhar o desafio **75 Hard** — 75 dias seguidos de 6 tarefas diárias. Falhou = volta ao dia 1.

## Stack

- Expo SDK 52 + expo-router (React Native + TypeScript)
- Supabase (Auth via magic link, Postgres, Storage)
- Zustand (state), date-fns, react-native-svg

## Setup

1. `npm install`
2. Copie `.env.example` para `.env.local` e preencha as chaves do Supabase.
3. Aplique a migration em `supabase/migrations/0001_h75_init.sql`.
4. Crie o bucket `h75-progress-photos` (privado) no Supabase Storage.
5. `npx expo start`, escaneie o QR com Expo Go.

## Regras do desafio

- 2 treinos de 45 min (1 obrigatoriamente outdoor)
- Seguir uma dieta, sem álcool
- Beber 3,7 L de água
- Ler 10 páginas de não-ficção
- 1 foto de progresso diária
- Falhou qualquer tarefa → reset automático para o Dia 1

## Estrutura

```
app/            rotas (expo-router)
components/     UI compartilhada
lib/            supabase, notifications, streak, photo
store/          zustand (auth, challenge)
theme/          cores
types/          tipos
supabase/       migrations
```
