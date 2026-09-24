import { createClient } from "npm:@supabase/supabase-js@2";
import { tg, kick } from "../_shared/tg.ts";
import { menu, WELCOME, REWARDS, NOT_YET, DISCLAIMER } from "../_shared/copy.ts";
import { recentActivity } from "../_shared/feed.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CHAT = Deno.env.get("SKIF_CHAT_ID") ?? "";
const SECRET = Deno.env.get("TG_WEBHOOK_SECRET")!;
const MINIAPP = Deno.env.get("MINIAPP_URL")!;
// Comma-separated Telegram user IDs that are never deleted or kicked (the host/owner).
const OWNERS = new Set((Deno.env.get("SKIF_OWNER_IDS") ?? "").split(",").map((x) => x.trim()).filter(Boolean));

Deno.serve(async (req) => {
  // One-tap setup: GET ?setup=<TG_WEBHOOK_SECRET> registers the webhook using the token stored in Supabase.
  const url = new URL(req.url);
  if (req.method === "GET" && SECRET && url.searchParams.get("setup") === SECRET) {
    const me = await tg("getMe", {});
    const hook = await tg("setWebhook", {
      url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/tg-webhook`,
      secret_token: SECRET,
      allowed_updates: ["message", "chat_join_request", "chat_member", "inline_query"],
    });
    return Response.json({ bot: me.result?.username ?? me, webhook: hook });
  }
  // Only Telegram (holding the secret) can talk to this endpoint.
  if (req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) return new Response("forbidden", { status: 403 });
  let u: any;
  try { u = await req.json(); } catch { return new Response("ok"); }
  try { await handle(u); } catch (e) { console.error(e); } // always 200 → no Telegram retry storms
  return new Response("ok");
});

async function feedText() {
  const lines = await recentActivity(10);
  return lines.length ? `📈 Latest $uNRMN activity\n\n${lines.join("\n")}` : "Activity feed unavailable right now — see https://utoken.gg/token/unrmn";
}

async function handle(u: any) {
  // 1. Join request on the SKIF link → DM the gate
  const jr = u.chat_join_request;
  if (jr && CHAT && String(jr.chat.id) === CHAT) {
    await tg("sendMessage", { chat_id: jr.user_chat_id, text: WELCOME, reply_markup: menu(true) });
  }

  // 2. DM commands. There are NO admin/config commands — the bot can't be reconfigured from Telegram.
  const m = u.message;
  if (m?.chat?.type === "private" && typeof m.text === "string") {
    const cmd = m.text.split(/[\s@]/)[0].toLowerCase();
    if (cmd === "/start" || cmd === "/menu") await tg("sendMessage", { chat_id: m.chat.id, text: WELCOME, reply_markup: menu(true) });
    else if (cmd === "/rewards") await tg("sendMessage", { chat_id: m.chat.id, text: REWARDS, reply_markup: menu(true) });
    else if (cmd === "/feed") await tg("sendMessage", { chat_id: m.chat.id, text: await feedText(), reply_markup: menu(true) });
  }
  // /chatid only works until SKIF_CHAT_ID is set, then it's disabled.
  if (!CHAT && m?.text?.startsWith("/chatid")) await tg("sendMessage", { chat_id: m.chat.id, text: String(m.chat.id) });

  // 3. Inline mode: @YourBot in any chat
  const q = u.inline_query;
  if (q) {
    const art = (id: string, title: string, description: string, text: string) => ({
      type: "article", id, title, description,
      input_message_content: { message_text: text, link_preview_options: { is_disabled: true } },
      reply_markup: menu(false),
    });
    await tg("answerInlineQuery", {
      inline_query_id: q.id,
      cache_time: 30,
      button: { text: "🔐 Connect wallet & verify $uNRMN", web_app: { url: MINIAPP } },
      results: [
        art("verify", "🔐 Enter the µNORMAN SKIF", "Hold or stake ≥10 $uNRMN to join the VIP chat", WELCOME),
        art("buy", "🛒 Buy $uNRMN", "uToken · Uniswap · mint.club", NOT_YET("0").replace(/^You hold 0 \$uNRMN — you need/, "You need") ),
        art("live", "📈 Latest $uNRMN activity", "Mints, buys, sells, sends", await feedText()),
        art("rewards", "💰 Collector rewards & yield", "Quarterly yield from Oct 1, 2026", REWARDS),
      ],
    });
  }

  // 5. Nobody talks in SKIF without a verified wallet: unverified posters are deleted + removed (admins exempt).
  if (m && CHAT && String(m.chat?.id) === CHAT && m.from && !m.from.is_bot && !m.sender_chat &&
      !m.is_automatic_forward && !OWNERS.has(String(m.from.id))) {
    const uid = m.from.id;
    const { data } = await sb.from("skif_members").select("is_holder").eq("tg_user_id", uid).maybeSingle();
    if (!data?.is_holder) {
      const member = await tg("getChatMember", { chat_id: CHAT, user_id: uid });
      // Only act on a confirmed plain member — a failed lookup must never delete (it used to hit the owner).
      if (!member.ok) console.error("getChatMember failed", uid, member.description);
      else if (["member", "restricted"].includes(member.result?.status)) {
        await tg("deleteMessage", { chat_id: CHAT, message_id: m.message_id });
        await kick(CHAT, uid);
        await tg("sendMessage", { chat_id: uid, text: `You were removed from µNORMAN SKIF — link a wallet holding or staking ≥10 $uNRMN first, then rejoin.\n\n${WELCOME}`, reply_markup: menu(true) });
      }
    }
  }

  // 4. Anyone in SKIF who isn't a verified holder gets kicked — including people admins add manually.
  const cm = u.chat_member;
  if (cm && CHAT && String(cm.chat.id) === CHAT && cm.new_chat_member.status === "member" &&
      !["member", "administrator", "creator"].includes(cm.old_chat_member.status)) {
    const uid = cm.new_chat_member.user.id;
    if (OWNERS.has(String(uid))) return;
    const { data } = await sb.from("skif_members").select("is_holder").eq("tg_user_id", uid).maybeSingle();
    if (!data?.is_holder) await kick(CHAT, uid);
  }
}
