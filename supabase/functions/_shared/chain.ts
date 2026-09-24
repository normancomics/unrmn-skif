import { createPublicClient, http, defineChain, parseAbi, formatUnits } from "npm:viem@2";

const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [Deno.env.get("RPC_URL") ?? "https://rpc.mainnet.chain.robinhood.com"] } },
});
const client = createPublicClient({ chain: robinhood, transport: http() });
const TOKEN = (Deno.env.get("TOKEN_ADDRESS") ?? "0x7ed16d612215b650434d7e45827cf080ea0d0f63") as `0x${string}`;
// Mint Club V2 Stake contract on Robinhood Chain (pool 1 = $uNRMN → $uFEELSFAKE)
const STAKE = (Deno.env.get("STAKE_CONTRACT") ?? "0xF44939c1613143ad587c79602182De7DcF593e33") as `0x${string}`;

const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);
const stakeAbi = parseAbi([
  "function poolCount() view returns (uint256)",
  "function pools(uint256) view returns (address stakingToken)",               // first field of Pool struct
  "function userPoolStake(address,uint256) view returns (uint104 stakedAmount)", // first field of UserStake struct
]);

let dec: number | undefined;
async function decimals() {
  if (dec !== undefined) return dec;
  try { dec = Number(await client.readContract({ address: TOKEN, abi: erc20, functionName: "decimals" })); }
  catch { dec = 0; }
  return dec;
}

// Every Mint Club pool whose staking token is $uNRMN (re-scanned every 10 min so new pools count automatically)
let pools: bigint[] = []; let poolsAt = 0;
async function unrmnPools() {
  if (Date.now() - poolsAt < 600_000) return pools;
  const n = await client.readContract({ address: STAKE, abi: stakeAbi, functionName: "poolCount" });
  const found: bigint[] = [];
  for (let i = 0n; i < n; i++) {
    const t = await client.readContract({ address: STAKE, abi: stakeAbi, functionName: "pools", args: [i] });
    if (t.toLowerCase() === TOKEN.toLowerCase()) found.push(i);
  }
  pools = found; poolsAt = Date.now();
  return pools;
}

// Wallet balance + $uNRMN staked on mint.club both count. Throws on RPC failure — callers must NOT kick on error.
export async function meetsThreshold(wallet: `0x${string}`) {
  const [bal, d, ids] = await Promise.all([
    client.readContract({ address: TOKEN, abi: erc20, functionName: "balanceOf", args: [wallet] }),
    decimals(),
    unrmnPools(),
  ]);
  let staked = 0n;
  for (const id of ids) {
    staked += await client.readContract({ address: STAKE, abi: stakeAbi, functionName: "userPoolStake", args: [wallet, id] });
  }
  const total = bal + staked;
  const min = BigInt(Deno.env.get("MIN_BALANCE") ?? "10") * 10n ** BigInt(d);
  const display = staked > 0n
    ? `${formatUnits(total, d)} (${formatUnits(bal, d)} in wallet + ${formatUnits(staked, d)} staked)`
    : formatUnits(total, d);
  return { ok: total >= min, display };
}
