import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  initVaultSigner, getVaultSignerAddress,
  getVirtualBalance, getStakingTiers,
  toggleStaking, applyYield, generateSettlementVoucher, processAllYields,
} from "./vault.js";
import { writeLog } from "./log.js";

const app = new Hono();

app.use("/*", cors());

let initialized = false;
function ensureInitialized(env) {
  if (initialized) return;
  if (env.SIGNER_PRIVATE_KEY) initVaultSigner(env.SIGNER_PRIVATE_KEY);
  initialized = true;
}

app.get("/api/vault/balance/:address", async (c) => {
  try {
    ensureInitialized(c.env);
    const bal = await getVirtualBalance(c.env.DB, c.req.param("address"));
    return c.json(bal);
  } catch (e) {
    await writeLog(c.env.DB, { message: e.message, source: "get-balance", user: c.req.param("address") });
    return c.json({ error: e.message }, 500);
  }
});

app.get("/api/vault/tiers", async (c) => {
  return c.json(getStakingTiers());
});

app.post("/api/vault/stake", async (c) => {
  try {
    ensureInitialized(c.env);
    const { address, active, tierId } = await c.req.json();
    if (!address) return c.json({ error: "address required" }, 400);
    const result = await toggleStaking(c.env.DB, address, active, tierId || 0);
    return c.json(result);
  } catch (e) {
    await writeLog(c.env.DB, { message: e.message, source: "stake", user: address || "" });
    return c.json({ error: e.message }, 500);
  }
});

app.post("/api/vault/yield/apply", async (c) => {
  try {
    const { address } = await c.req.json();
    if (!address) return c.json({ error: "address required" }, 400);
    const bal = await applyYield(c.env.DB, address);
    return c.json(bal);
  } catch (e) {
    await writeLog(c.env.DB, { message: e.message, source: "yield-apply", user: address || "" });
    return c.json({ error: e.message }, 500);
  }
});

app.post("/api/vault/settle/request", async (c) => {
  try {
    ensureInitialized(c.env);
    const { address } = await c.req.json();
    if (!address) return c.json({ error: "address required" }, 400);
    const result = await generateSettlementVoucher(c.env, address);
    return c.json(result);
  } catch (e) {
    await writeLog(c.env.DB, { message: e.message, source: "settle-request", user: address || "" });
    return c.json({ error: e.message }, 500);
  }
});

app.post("/api/vault/yield/cron", async (c) => {
  try {
    const auth = c.req.header("X-Cron-Secret");
    if (auth !== c.env.CRON_SECRET) return c.json({ error: "Unauthorized" }, 401);
    const count = await processAllYields(c.env.DB);
    return c.json({ processed: count });
  } catch (e) {
    await writeLog(c.env.DB, { message: e.message, source: "yield-cron" });
    return c.json({ error: e.message }, 500);
  }
});

// --- Marketplace ---

app.get("/api/marketplace/listings", async (c) => {
  try {
    const chainId = c.req.query("chainId") || "80002";
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM marketplace_listings WHERE chain_id = ? ORDER BY created_at DESC"
    ).bind(Number(chainId)).all();
    return c.json(results || []);
  } catch (e) {
    return c.json([]);
  }
});

app.post("/api/marketplace/list", async (c) => {
  try {
    const { seller, price, metadataURI, category, pricing, chainId, listingId } = await c.req.json();
    if (!seller || !metadataURI) return c.json({ error: "seller and metadataURI required" }, 400);
    await c.env.DB.prepare(
      "INSERT INTO marketplace_listings (listing_id, seller, price, metadata_uri, category, pricing, status, chain_id, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, datetime('now'))"
    ).bind(listingId || 0, seller, price || "0", metadataURI, category || "", pricing || 0, Number(chainId || 80002)).run();
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

app.post("/api/marketplace/update", async (c) => {
  try {
    const { listingId, status, chainId } = await c.req.json();
    if (listingId === undefined) return c.json({ error: "listingId required" }, 400);
    await c.env.DB.prepare(
      "UPDATE marketplace_listings SET status = ? WHERE listing_id = ? AND chain_id = ?"
    ).bind(status, listingId, Number(chainId || 80002)).run();
    return c.json({ ok: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

app.get("/api/contracts", async (c) => {
  const chainId = Number(c.req.query("chainId") || "80002");
  const CONTRACT_MAP = {
    80002: {
      DigitalGoods: { address: "0x612B5dda1BCBe17Dff554bb446A8018a574DBe37", name: "DigitalGoods", chainId: 80002, verified: true },
      FreelancerEscrow: { address: "0xBF4588E207c2191Ee9D3f114370a6dbf4BACFFf3", name: "FreelancerEscrow", chainId: 80002, verified: true },
      DigitalRWA: { address: "0x89f5394a468343F405285040664Fd77843D2a2e6", name: "DigitalRWA", chainId: 80002, verified: true },
    },
    84532: {
      DigitalGoods: { address: "0x28f00E0CAaC46D2A2EEBB47A5B8A141bAcCe9963", name: "DigitalGoods", chainId: 84532, verified: true },
      FreelancerEscrow: { address: "0x686C4711a35633479F3Fed0D83b34DA63878CA00", name: "FreelancerEscrow", chainId: 84532, verified: true },
      DigitalRWA: { address: "0xE8FC7AbF3F4B95A2843C879F894AF6B9d8D297cC", name: "DigitalRWA", chainId: 84532, verified: true },
    },
    421614: {
      DigitalGoods: { address: "0xe7bFE19CeEd30871d50394E0c7C0b3b647aa85A0", name: "DigitalGoods", chainId: 421614, verified: true },
      FreelancerEscrow: { address: "0x6AE0E1bBE014D222417eF3A350088A0204Ed9bF4", name: "FreelancerEscrow", chainId: 421614, verified: true },
      DigitalRWA: { address: "0xCF1295f1f4F72eD6A2289EACc13673C53a5Ef865", name: "DigitalRWA", chainId: 421614, verified: true },
    },
  };
  return c.json(CONTRACT_MAP[chainId] || {});
});

app.get("/api/chains/status", async (c) => {
  return c.json({
    80002: { name: "Polygon Amoy", blockNumber: 0, connected: true },
    84532: { name: "Base Sepolia", blockNumber: 0, connected: true },
    421614: { name: "Arbitrum Sepolia", blockNumber: 0, connected: true },
  });
});

export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    try {
      const count = await processAllYields(env.DB);
      console.log(`[Cron] Processed yields for ${count} active stakers`);
    } catch (e) {
      await writeLog(env.DB, { message: "Cron yield processing failed", details: e.message, source: "cron" });
    }
  },
};
