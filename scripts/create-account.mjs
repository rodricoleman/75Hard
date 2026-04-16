#!/usr/bin/env node
// Cria uma conta direto no Supabase, sem precisar de invite code.
// Uso:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/create-account.mjs \
//       --email you@example.com \
//       --password 'senhaSegura' \
//       --username rodri \
//       --display-name 'Rodrigo'
//
// Também aceita as mesmas chaves do .env:
//   EXPO_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
//
// A service role key fica no Supabase Dashboard → Project Settings → API.
// NUNCA comite essa chave. Ela bypassa RLS.

import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
    out[key] = val;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);

  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      'Faltando SUPABASE_URL (ou EXPO_PUBLIC_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY no env.',
    );
    process.exit(1);
  }

  const email = args.email;
  const password = args.password;
  const username = (args.username || '').toLowerCase();
  const displayName = args['display-name'] || args.displayName || null;

  if (!email || !password || !username) {
    console.error('Uso: --email ... --password ... --username ... [--display-name ...]');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Senha precisa ter 6+ caracteres.');
    process.exit(1);
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    console.error('Username inválido. Use 3-20 letras minúsculas, números ou _.');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Username já em uso?
  const { data: existing, error: selErr } = await admin
    .from('h75_profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (selErr) {
    console.error('Erro ao checar username:', selErr.message);
    process.exit(1);
  }
  if (existing) {
    console.error(`Username "${username}" já está em uso.`);
    process.exit(1);
  }

  // 2. Cria usuário no Auth com email já confirmado.
  console.log(`> criando auth user ${email}...`);
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr) {
    console.error('Erro criando auth user:', createErr.message);
    process.exit(1);
  }
  const uid = created.user.id;
  console.log(`  id: ${uid}`);

  // 3. Upsert profile com username/display_name. O trigger h75_on_user_created
  //    já cria a linha em h75_profiles; aqui só completamos.
  const { error: profErr } = await admin
    .from('h75_profiles')
    .upsert(
      {
        id: uid,
        username,
        display_name: displayName || username,
      },
      { onConflict: 'id' },
    );
  if (profErr) {
    console.error('Erro salvando profile:', profErr.message);
    console.error('Removendo auth user para deixar estado limpo...');
    await admin.auth.admin.deleteUser(uid).catch(() => {});
    process.exit(1);
  }

  // 4. Cria challenge inicial se ainda não existir.
  const { data: ch } = await admin
    .from('h75_challenges')
    .select('id')
    .eq('user_id', uid)
    .limit(1);
  if (!ch || ch.length === 0) {
    const { error: chErr } = await admin.from('h75_challenges').insert({ user_id: uid });
    if (chErr) {
      console.error('Aviso: não consegui criar challenge inicial:', chErr.message);
    }
  }

  console.log('\nConta criada com sucesso.');
  console.log(`  email:    ${email}`);
  console.log(`  username: ${username}`);
  console.log('Agora é só entrar pela tela de login do app.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
