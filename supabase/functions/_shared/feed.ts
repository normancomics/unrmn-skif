import { TOKEN } from "./copy.ts";
const ZERO = "0x0000000000000000000000000000000000000000";
const short = (a = "") => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "?";

export async function recentActivity(n = 10): Promise<string[]> {
  const r = await fetch(`https://robinhoodchain.blockscout.com/api/v2/tokens/${TOKEN}/transfers`);
  if (!r.ok) return [];
  const { items = [] } = await r.json();
  return items.slice(0, n).map((t: any) => {
    const from = t.from?.hash ?? "", to = t.to?.hash ?? "";
    const kind = from.toLowerCase() === ZERO ? "MINT" : to.toLowerCase() === ZERO ? "BURN"
      : (t.method ? String(t.method).toUpperCase() : "SEND");
    const dec = Number(t.total?.decimals ?? 0);
    const amt = t.total?.value != null
      ? (Number(BigInt(t.total.value)) / 10 ** dec).toLocaleString("en-US", { maximumFractionDigits: 4 })
      : (t.total?.token_id != null ? `#${t.total.token_id}` : "");
    const when = t.timestamp ? new Date(t.timestamp).toISOString().slice(5, 16).replace("T", " ") : "";
    return `${kind} ${amt} $uNRMN · ${short(from)} → ${short(to)} · ${when} UTC`;
  });
}
