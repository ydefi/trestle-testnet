import { API_BASE, AI_API_BASE } from "../config/contracts";

type AstraContext = Record<string, string>;

async function tryDirectAPI(message: string, context?: AstraContext): Promise<string | null> {
  try {
    const ctx = context
      ? Object.entries(context).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n")
      : "";
    const prompt = ctx ? `Context:\n${ctx}\n\nUser: ${message}` : message;
    const system = "You are Astra, the Trestle DeFi AI assistant. You help users with staking, rewards, marketplace, disputes, and platform questions. Be concise and helpful.";

    const r = await fetch(`${AI_API_BASE}/api/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user: prompt }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.content || data.response || null;
  } catch {
    return null;
  }
}

async function tryProxyAPI(message: string, context?: AstraContext): Promise<string | null> {
  try {
    const r = await fetch(`${API_BASE}/api/astra/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.response || null;
  } catch {
    return null;
  }
}

export async function astraChat(message: string, context?: AstraContext): Promise<string> {
  const result = (await tryDirectAPI(message, context)) || (await tryProxyAPI(message, context));
  return result || "Astra is offline. Check ASTRA_API_URL.";
}

export async function analyzeListing(title: string, description: string, price: string) {
  return fetch(`${API_BASE}/api/astra/marketplace/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, price }),
  });
}

export async function resolveDispute(data: any) {
  return fetch(`${API_BASE}/api/astra/dispute/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getTaskRecommendations(userData: any) {
  return fetch(`${API_BASE}/api/astra/rewards/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

export async function getAstraProviders() {
  return fetch(`${API_BASE}/api/astra/providers`);
}
