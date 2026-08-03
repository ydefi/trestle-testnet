const KV_KEY = "astra:providers";
const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";

async function tryCloudflare(env, { messages, temperature, format }) {
  if (!env.AI) return null;
  try {
    const input = { messages, temperature: temperature ?? 0.3 };
    if (format) input.response_format = { type: "json_object" };
    const result = await env.AI.run(CF_MODEL, input);
    const text = result?.response || "";
    if (text) return text;
  } catch (e) {
    console.error("Cloudflare AI failed:", e.message);
  }
  return null;
}

class ProviderManager {
  constructor(providers) {
    this.providers = providers;
    this.currentIndex = 0;
  }

  async callProvider(provider, { messages, temperature, format }) {
    const body = {
      model: provider.model,
      messages,
      temperature: temperature ?? 0.3,
      stream: false,
    };
    if (format) body.response_format = { type: "json_object" };

    const headers = { "Content-Type": "application/json" };
    if (provider.apiKey) headers["Authorization"] = `Bearer ${provider.apiKey}`;

    const r = await fetch(`${provider.url}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`API ${r.status} from ${provider.name}`);
    return (await r.json()).choices?.[0]?.message?.content || "";
  }

  async getResponse(env, args) {
    const cfResult = await tryCloudflare(env, args);
    if (cfResult) return cfResult;

    let attempts = 0;
    const start = this.currentIndex;
    while (attempts < this.providers.length) {
      const idx = (start + attempts) % this.providers.length;
      const provider = this.providers[idx];
      try {
        const result = await this.callProvider(provider, args);
        this.currentIndex = (idx + 1) % this.providers.length;
        return result;
      } catch (e) {
        console.error(`${provider.name} failed:`, e.message);
        attempts++;
      }
    }
    return null;
  }
}

let _manager = null;

async function loadProviders(env) {
  const raw = env.ASTRA_KV ? await env.ASTRA_KV.get(KV_KEY, "text") : null;
  if (raw) {
    try {
      const providers = JSON.parse(raw);
      if (providers.length > 0) return providers;
    } catch (e) {
      console.error("Invalid providers in KV:", e.message);
    }
  }
  return null;
}

async function getManager(env) {
  if (_manager) return _manager;

  const fromKV = await loadProviders(env);
  if (fromKV) {
    _manager = new ProviderManager(fromKV);
    return _manager;
  }

  const fallbackUrl = env.ASTRA_API_URL;
  if (fallbackUrl) {
    _manager = new ProviderManager([{
      name: "default",
      url: fallbackUrl,
      apiKey: env.ASTRA_API_KEY || "",
      model: env.ASTRA_MODEL || "gpt-4o-mini",
    }]);
  } else {
    _manager = new ProviderManager([]);
  }
  return _manager;
}

export async function ask(env, system, user) {
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  return (await getManager(env)).getResponse(env, { messages });
}
