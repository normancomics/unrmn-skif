import { createClient } from "npm:@supabase/supabase-js@2";
import { tg, kick } from "../_shared/tg.ts";
import { meetsThreshold } from "../_shared/chain.ts";
import { menu, NOT_YET, CONGRATS, REWARDS } from "../_shared/copy.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CHAT = Deno.env.get("SKIF_CHAT_ID")!;

Deno.serve(async (req) => {
  const { data: secret } = await sb.rpc("skif_cron_secret"); // generated in Vault, never leaves the DB
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("forbidden", { status: 403 });
  if (!CHAT) return Response.json({ skipped: "SKIF_CHAT_ID not set" });
  const { data } = await sb.from("skif_members").select("tg_user_id, wallet, is_holder");
  let kicked = 0, promoted = 0;
  for (const m of data ?? []) {
    let r: { ok: boolean; display: string };
    try { r = await meetsThreshold(m.wallet); } catch { continue; } // RPC down ≠ kick

    if (m.is_holder && !r.ok) {
      await kick(CHAT, m.tg_user_id);
      await sb.from("skif_members").update({ is_holder: false }).eq("tg_user_id", m.tg_user_id);
      await tg("sendMessage", { chat_id: m.tg_user_id, text: `Removed from SKIF.\n\n${NOT_YET(r.display)}`, reply_markup: menu(true) });
      kicked++;
    } else if (!m.is_holder && r.ok) {
      await sb.from("skif_members").update({ is_holder: true }).eq("tg_user_id", m.tg_user_id);
      const inv = await tg("createChatInviteLink", {
        chat_id: CHAT, member_limit: 1, expire_date: Math.floor(Date.now() / 1000) + 3600,
      });
      await tg("sendMessage", { chat_id: m.tg_user_id, text: CONGRATS });
      await tg("sendMessage", { chat_id: m.tg_user_id, text: REWARDS, reply_markup: menu(true) });
      await tg("sendMessage", { chat_id: m.tg_user_id, text: `🔑 Your SKIF invite (single-use, 1 hour): ${inv.result?.invite_link ?? "use /start to re-verify"}` });
      promoted++;
    }
  }
  return Response.json({ checked: data?.length ?? 0, kicked, promoted });
});
