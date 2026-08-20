const AI_API = process.env.NEXT_PUBLIC_AI_API_URL ?? "https://ai.trestle.website";
const REWARD_API = process.env.NEXT_PUBLIC_REWARD_API_URL ?? "https://reward-api.trestle.website";

type JonahContext = Record<string, string>;

const SYSTEM_PROMPT = `You are Jonah, a head moderator and the Trestle DeFi community assistant. Trestle is a decentralized finance platform with:
- A digital goods marketplace for buying/selling digital items
- Real World Asset (RWA) tokenization and management
- Staking pools (tier1 staking, tier2 staking)
- Reward hub with tasks, identity verification, and claim system
- Community governance
Trestle is NOT a cryptocurrency exchange or DEX for trading tokens. You help users with questions about the platform, moderation, disputes, and community matters. Be friendly and accurate.`;

async function tryDirectAPI(message: string, context?: JonahContext): Promise<string | null> {
  try {
    const system = context?.address
      ? `${SYSTEM_PROMPT}\nThe user's wallet is ${context.address}.`
      : SYSTEM_PROMPT;
    const r = await fetch(`${AI_API}/api/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user: message }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return typeof data.content === "string" ? data.content : JSON.stringify(data.content);
  } catch {
    return null;
  }
}

async function tryProxyAPI(message: string, context?: JonahContext): Promise<string | null> {
  try {
    const r = await fetch(`${REWARD_API}/api/astra/chat`, {
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

export async function jonahChat(message: string, context?: JonahContext): Promise<string> {
  const result = (await tryDirectAPI(message, context)) || (await tryProxyAPI(message, context));
  return result || "Jonah is offline. Try again later.";
}
