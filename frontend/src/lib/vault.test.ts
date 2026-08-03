import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getVaultBalance,
  getVaultTiers,
  setVaultStaking,
  applyYield,
  requestSettlement,
} from "./vault";
import { VAULT_API_BASE } from "../config/contracts";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("vault API", () => {
  it("getVaultBalance calls correct endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user_address: "0x123", virtual_hnobt: "100" }),
    } as Response);

    const result = await getVaultBalance("0x123");
    expect(result.user_address).toBe("0x123");
    expect(fetch).toHaveBeenCalledWith(
      `${VAULT_API_BASE}/api/vault/balance/0x123`,
      expect.anything(),
    );
  });

  it("getVaultTiers returns tiers", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, label: "Bronze" }]),
    } as Response);

    const result = await getVaultTiers();
    expect(result).toHaveLength(1);
  });

  it("setVaultStaking sends POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    } as Response);

    await setVaultStaking("0xabc", true, 2);
    expect(fetch).toHaveBeenCalledWith(
      `${VAULT_API_BASE}/api/vault/stake`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ address: "0xabc", active: true, tierId: 2 }),
      }),
    );
  });

  it("applyYield calls POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await applyYield("0xdef");
    expect(fetch).toHaveBeenCalledWith(
      `${VAULT_API_BASE}/api/vault/yield/apply`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("requestSettlement calls POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await requestSettlement("0xdef");
    expect(fetch).toHaveBeenCalledWith(
      `${VAULT_API_BASE}/api/vault/settle/request`,
      expect.objectContaining({ method: "POST" }),
    );
  });
});
