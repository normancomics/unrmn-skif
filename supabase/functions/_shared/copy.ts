export const TOKEN = "0x7ed16d612215b650434d7e45827cf080ea0d0f63";
export const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"; // Robinhood Chain WETH
const BOT = Deno.env.get("BOT_USERNAME")!;
const MINIAPP = Deno.env.get("MINIAPP_URL")!;

export const LINKS = {
  utokenToken: "https://utoken.gg/token/unrmn",
  utokenCollection: "https://utoken.gg/collection/unrmn",
  uniswap: `https://app.uniswap.org/swap?chain=robinhood&inputCurrency=${WETH}&outputCurrency=${TOKEN}`,
  feelsFake: Deno.env.get("LINK_UFEELSFAKE") ?? "https://mint.club/staking/robinhood/1",
  feelsFakeToken: Deno.env.get("LINK_UFEELSFAKE_TOKEN") ?? "https://mint.club/token/robinhood/UFEELSFAKE",
  pepeCash: Deno.env.get("LINK_UPEPECASH") ?? "https://mint.club/nft/robinhood/UPEPECASH",
  xCollection: "https://x.com/uNORMANCOMICS",
  xCreator: "https://x.com/KEKBONDS",
  github: "https://github.com/normancomics/uNRMN",
  treasure1: "https://x.com/unormancomics/status/2101106971264913494",
  treasure2: "https://x.com/unormancomics/status/2101767563751395785",
};

export const menu = (inPrivate: boolean) => ({
  inline_keyboard: [
    [inPrivate
      ? { text: "🔐 Connect wallet / Verify", web_app: { url: MINIAPP } }
      : { text: "🔐 Connect wallet / Verify", url: `https://t.me/${BOT}?start=verify` }],
    [{ text: "🛒 Buy $uNRMN (uToken)", url: LINKS.utokenToken }, { text: "🦄 Swap WETH→$uNRMN", url: LINKS.uniswap }],
    [{ text: "🃏 Mint / reveal µNORMAN cards", url: LINKS.utokenCollection }],
    [{ text: "🛠 Follow the Hybrid-DeFi dApp build (GitHub)", url: LINKS.github }],
    [{ text: "🥩 $uNRMN × $uFEELSFAKE staking", url: LINKS.feelsFake }],
    [{ text: "🐸 $uFEELSFAKE", url: LINKS.feelsFakeToken }, { text: "🐸 $uPEPECASH", url: LINKS.pepeCash }],
    [inPrivate
      ? { text: "📈 Live $uNRMN activity", web_app: { url: `${MINIAPP}#live` } }
      : { text: "📈 Live $uNRMN activity", url: LINKS.utokenCollection }],
    [{ text: "𝕏 @uNORMANCOMICS", url: LINKS.xCollection }, { text: "𝕏 @KEKBONDS", url: LINKS.xCreator }],
  ],
});

export const DISCLAIMER = "Not financial advice. Crypto is volatile — only spend what you can afford to lose. DYOR.";

export const WELCOME =
`µNORMAN ($uNRMN) — VIP SKIF gate

Hold at least 10 $uNRMN on Robinhood Chain — in your wallet or staked on mint.club — to enter the token-gated SKIF. Connect your wallet below — the bot keeps checking it around the clock.

🛠 Follow the $uNRMN Hybrid-DeFi dApp build: ${LINKS.github} — hodlr's get beta access before launch.

/rewards — collector rewards & yield
/feed — latest $uNRMN activity`;

export const NOT_YET = (bal: string) =>
`You hold ${bal} $uNRMN — you need at least 10 to enter the SKIF.

Grab some below 👇 The bot is watching your wallet and will message you the moment you hit 10.

$uNRMN is VERY NEW — you are still VERY EARLY. Buying $uNRMN, $uPEPECASH & $uFEELSFAKE is a SMART MOVE.
• Buy on uToken, or swap WETH → $uNRMN on Uniswap (any token you hold works — just change the input)
• Stake $uNRMN × $uFEELSFAKE on mint.club — $uFEELSFAKE plays an important role in the soon-to-be-released $uNRMN Hybrid-DeFi dApp
• $uPEPECASH is also on mint.club

${DISCLAIMER}`;

export const CONGRATS =
`THERE YOU GO! YOU ARE ON YOUR WAY NOW! HODL YOUR $uNRMN CLOSE & ALWAYS ATTEMPT TO GAIN MORE.

IF YOU HAVE NOT REVEALED YOUR LAYERS YET & UNVEILED YOUR μNORMAN ($uNRMN) CARD(S) w/ every layer & piece minted directly on-chain:
• 1 μNORMAN card = 1 $uNRMN & comes w/
• Collector Rewards:
 - $uNRMN collectors/loyalists/hodlrs receive bonus random airdrops of NFTs, Tokens, Rare original digital & physical artwork, Exclusive NORMAN merchandise & more
• $uNRMN expansion packs coming soon
• $uNRMN hodlrs earn quarterly yield for displaying their μNORMAN cards as PFPs on social-media
• VIP token-gated $uNRMN SKIF(CHAT) for hodlr's/loyalists
• $uNRMN nº1 (available on uToken secondary market) contains a massive treasure 🦄🐸💀✍️
• Hybrid-DeFi/Immutable Generative Pixel-Art Collection of 10k μNORMAN Cards, minted & revealed layer by layer.
• Hand-drawn by NORMANCOMICS (normancomics.eth), Cartoonist & Creator of the comic-strip, "NORMAN®"
• A certified FakeRare Artist
• CryptoArt OG from the BC (Before Christie's) Era
• Since 2020, NORMANCOMICS has released collections on EVM, BTC & IBC🧱⛓️'s
• 1st Hybrid-DeFi NORMAN collection available on Robinhood via uTokenPro…

🃏 Reveal / mint your cards: ${LINKS.utokenCollection}`;

export const ROADMAP =
`🛠 FOLLOW THE $uNRMN HYBRID-DeFi dApp BUILD: ${LINKS.github}

• $uNRMN Collectors/Hodlr's & Loyalists gain BETA ACCESS before the announced launch.
• The dApp goes MAINNET when $uNRMN GRADUATES on uToken — when the bonding curve reaches/passes Ξ9.99 ETH.
• THE 1st $uNRMN EXPANSION SET releases when the bonding curve reaches/passes Ξ4.5 ETH: ${LINKS.utokenToken}`;

export const REWARDS =
`💰 QUARTERLY YIELD — beginning October 1st, 2026 A.D., the year of our Lord, $uNRMN hodlr's earn quarterly yield in $uNRMN, plus other $uNRMN-affiliated & balanced token(s) dropped straight to your wallet.

🪂 ALL $uNRMN collectors/hodlr's earn bonus airdrops & quarterly yield.
🏆 TOP hodlr's earn multiplied yield & extra airdrops.
🖼 Hodlr's who use their $uNRMN card as their PFP on web2/web3 socials earn multiplied yield & extra airdrops.
📣 Stay active in the $uNRMN chat on ${LINKS.utokenCollection} and post about $uNRMN on X, Farcaster & any other web2/web3 socials → multiplied yield & extra airdrops.

💎 Collect certain cards off the secondary markets for the HIGHEST rewards — some, including card nº1, come with a massive treasure: NFTs, TOKENS, Rare Pepes, Fake Rares, Physical Rare Pepe & Fake Rare Collectibles, Original Physical Artwork, Official Merchandise, Rare OG Crypto Art Ephemera & even a BRAND NEW ACS BitAxe Touch Ultra Solo Bitcoin Miner ($400 usd retail). The entire treasure is valued at roughly Ξ 5+ ETH:
${LINKS.treasure1}
${LINKS.treasure2}

🐸 $uFEELSFAKE plays an important role in the soon-to-be-released $uNRMN Hybrid-DeFi dApp. $uPEPECASH is also on mint.club.
⚡ $uNRMN is VERY NEW — you are still VERY EARLY. Buying $uNRMN, $uPEPECASH & $uFEELSFAKE is a SMART MOVE.

${ROADMAP}

NORMANCOMICS.ETH appreciates EVERY collector & supporter. 🙏
𝕏 ${LINKS.xCollection} · ${LINKS.xCreator}

${DISCLAIMER}`;
