-- Random secret generated inside the DB; never shown to anyone.
select vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'cron_secret');

-- Only the service role (Edge Functions) can read it.
create or replace function public.skif_cron_secret()
returns text language sql security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret' limit 1
$$;
revoke all on function public.skif_cron_secret() from public, anon, authenticated;
grant execute on function public.skif_cron_secret() to service_role;
