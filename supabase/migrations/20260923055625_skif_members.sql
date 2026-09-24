create table if not exists public.skif_members (
  tg_user_id  bigint primary key,
  wallet      text not null unique,
  is_holder   boolean not null default true,
  verified_at timestamptz not null default now()
);
alter table public.skif_members enable row level security;

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Every minute; cron secret is read from Vault so it never lives in this SQL.
select cron.schedule('skif-recheck', '* * * * *', $$
  select net.http_post(
    url     := 'https://kcxkznquxuqnwjkdbjsm.supabase.co/functions/v1/recheck',
    headers := jsonb_build_object(
      'content-type','application/json',
      'x-cron-secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'), '')
    ),
    body    := '{}'::jsonb
  );
$$);
