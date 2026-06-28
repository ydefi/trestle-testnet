const AI_API = process.env.NEXT_PUBLIC_AI_API_URL ?? "https://ai.trestle.website";

type JonahContext = Record<string, string>;

const SYSTEM_PROMPT = `You are Jonah, a head moderator and the Trestle DeFi community assistant. Trestle is a decentralized finance platform with:
- A digital goods marketplace for buying/selling digital items
- Real World Asset (RWA) tokenization and management
- Staking pools (tier1 staking, tier2 staking)
- Reward hub with tasks, identity verification, and claim system
- Community governance
Trestle is NOT a cryptocurrency exchange or DEX for trading tokens. You help users with questions about the platform, moderation, disputes, and community matters. Be friendly and accurate.`;

export async function jonahChat(message: string, context?: JonahContext) {
  const system = context?.address
    ? `${SYSTEM_PROMPT}\nThe user's wallet is ${context.address}.`
    : SYSTEM_PROMPT;
  try {
    const r = await fetch(`${AI_API}/api/ai/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, user: message }),
    });
    if (!r.ok) throw new Error("AI worker error");
    const data = await r.json();
    return typeof data.content === "string" ? data.content : JSON.stringify(data.content);
  } catch {
    return "Jonah is offline. Try again later.";
  }
}
