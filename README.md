# µNORMAN ($uNRMN) SKIF Bot

Token-gated Telegram bot for the µNORMAN ($uNRMN) SKIF chat on Robinhood Chain (4663).
Hold ≥10 $uNRMN → verified entry. Wallets are re-checked every minute.

- `supabase/functions/` — Edge Functions: `tg-webhook`, `verify`, `recheck` (+ `_shared/`)
- `supabase/migrations/` — `skif_members` table + pg_cron re-check
- `miniapp/index.html` — Telegram Mini App (wallet connect + live $uNRMN feed)

All secrets live in Supabase Edge Function Secrets — never commit them.

$uNRMN Hybrid-DeFi dApp: https://github.com/normancomics/uNRMN

Project contact: unrmn@tutamail.com
