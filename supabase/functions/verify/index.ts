import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyMessage, getAddress } from "npm:viem@2";
import { tg, validateInitData } from "../_shared/tg.ts";
import { meetsThreshold } from "../_shared/chain.ts";
import { menu, NOT_YET, CONGRATS, REWARDS } from "../_shared/copy.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CHAT = Deno.env.get("SKIF_CHAT_ID")!;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" };
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const { initData, address, signature } = await req.json();
    const user = await validateInitData(initData);
    if (!user) return json({ ok: false, error: "Telegram auth failed" }, 401);

    const auth = new URLSearchParams(initData).get("auth_date");
    const message = `uNRMN SKIF access\nTelegram ID: ${user.id}\nIssued: ${auth}`;
    const wallet = getAddress(address);
    if (!(await verifyMessage({ address: wallet, message, signature })))
      return json({ ok: false, error: "Bad signature" }, 401);

    const { ok: holder, display } = await meetsThreshold(wallet);
    const { data: prev } = await sb.from("skif_members").select("is_holder").eq("tg_user_id", user.id).maybeSingle();

    const { error } = await sb.from("skif_members")
      .upsert({ tg_user_id: user.id, wallet, is_holder: holder, verified_at: new Date().toISOString() });
    if (error) return json({ ok: false, error: error.code === "23505" ? "Wallet already linked to another account" : error.message }, 409);

    if (!holder) {
      await tg("sendMessage", { chat_id: user.id, text: NOT_YET(display), reply_markup: menu(true) });
      return json({ ok: false, error: `You hold ${display} $uNRMN — need 10. Buy links are in your chat with the bot; you'll get a message the moment you hit 10.` }, 403);
    }

    // Approve pending request; if none, hand back a single-use 10-min link
    const r = await tg("approveChatJoinRequest", { chat_id: CHAT, user_id: user.id });
    let link: string | undefined;
    if (!r.ok) {
      const inv = await tg("createChatInviteLink", {
        chat_id: CHAT, member_limit: 1, expire_date: Math.floor(Date.now() / 1000) + 600,
      });
      link = inv.result?.invite_link;
    }
    if (!prev?.is_holder) {
      await tg("sendMessage", { chat_id: user.id, text: CONGRATS });
      await tg("sendMessage", { chat_id: user.id, text: REWARDS, reply_markup: menu(true) });
    }
    return json({ ok: true, link });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
