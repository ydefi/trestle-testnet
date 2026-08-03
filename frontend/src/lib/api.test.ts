import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";
import { API_BASE } from "../config/contracts";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("api", () => {
  it("returns JSON on success", async () => {
    const mockData = { ok: true, data: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await api("/api/tasks");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/api/tasks`,
      expect.objectContaining({ headers: { "Content-Type": "application/json" } }),
    );
  });

  it("throws on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () => Promise.resolve({ error: "Invalid" }),
    } as Response);

    await expect(api("/test")).rejects.toThrow("Invalid");
  });

  it("falls back to statusText", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Server Error",
      json: () => Promise.reject(new Error("parse failed")),
    } as Response);

    await expect(api("/test")).rejects.toThrow("Server Error");
  });

  it("re-throws network errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network failure"));
    await expect(api("/test")).rejects.toThrow("Network failure");
  });
});
