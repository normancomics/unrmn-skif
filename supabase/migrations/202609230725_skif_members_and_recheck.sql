-- As deployed to Supabase project unrmn-skif.
create table if not exists public.skif_members (
  tg_user_id  bigint primary key,
  wallet      text not null unique,
  is_holder   boolean not null default true,
  verified_at timestamptz not null default now()
);
alter table public.skif_members enable row level security;
alter table public.skif_members force row level security;
drop policy if exists "service role can read skif_members" on public.skif_members;
create policy "service role can read skif_members"
  on public.skif_members
  for select
  to service_role
  using (true);
drop policy if exists "service role can insert skif_members" on public.skif_members;
create policy "service role can insert skif_members"
  on public.skif_members
  for insert
  to service_role
  with check (true);
drop policy if exists "service role can update skif_members" on public.skif_members;
create policy "service role can update skif_members"
  on public.skif_members
  for update
  to service_role
  using (true)
  with check (true);
drop policy if exists "service role can delete skif_members" on public.skif_members;
create policy "service role can delete skif_members"
  on public.skif_members
  for delete
  to service_role
  using (true);

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Every minute; cron secret is read from Vault (name: cron_secret).
do $$
declare
  existing_job_id bigint;
  cron_secret text;
  cron_command text;
begin
  select decrypted_secret
  into cron_secret
  from vault.decrypted_secrets
  where name = 'cron_secret'
  limit 1;

  if coalesce(cron_secret, '') = '' then
    raise exception 'Missing required vault secret: cron_secret';
  end if;

  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'skif-recheck'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  cron_command := format($cmd$
    select net.http_post(
      url     := 'https://kcxkznquxuqnwjkdbjsm.supabase.co/functions/v1/recheck',
      headers := jsonb_build_object(
        'content-type','application/json',
        'x-cron-secret', %L
      ),
      body    := '{}'::jsonb
    );
  $cmd$, cron_secret);

  perform cron.schedule('skif-recheck', '* * * * *', cron_command);
end
$$;
