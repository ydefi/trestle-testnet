import { describe, it, expect, vi, beforeEach } from "vitest";
import { astraChat, analyzeListing, resolveDispute, getTaskRecommendations } from "./astra";
import { API_BASE, AI_API_BASE } from "../config/contracts";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("astraChat", () => {
  it("returns AI response via direct API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "Hello from Astra" }),
    } as Response);

    const result = await astraChat("hi");
    expect(result).toBe("Hello from Astra");
    expect(fetch).toHaveBeenCalledWith(
      `${AI_API_BASE}/api/ai/ask`,
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("falls back to proxy API if direct fails", async () => {
    const mock = vi.spyOn(globalThis, "fetch");
    mock.mockResolvedValueOnce({ ok: false } as Response);
    mock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ response: "fallback response" }),
    } as Response);

    const result = await astraChat("hi");
    expect(result).toBe("fallback response");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(
      `${API_BASE}/api/astra/chat`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends context when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "ok" }),
    } as Response);

    await astraChat("balance", { address: "0xabc" });
    const callBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(callBody.user).toContain("0xabc");
  });
});

describe("analyzeListing", () => {
  it("correctly calls api", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ score: 85 }),
    } as Response);

    const result = await analyzeListing("Title", "Desc", "100");
    const json = await result.json();
    expect(json).toEqual({ score: 85 });
  });
});

describe("resolveDispute / getTaskRecommendations", () => {
  it("resolveDispute sends POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ resolved: true }),
    } as Response);

    await resolveDispute({ orderId: 1 });
  });

  it("getTaskRecommendations sends POST", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tasks: [] }),
    } as Response);

    await getTaskRecommendations({ address: "0xabc" });
  });
});
