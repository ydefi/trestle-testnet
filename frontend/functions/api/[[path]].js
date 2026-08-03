export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // This catches everything after /api/ in your URL
  const pathSegments = params.path || [];
  const apiPath = pathSegments.join("/");

  // 1. Build the target Blockscout URL
  // It uses the VITE_API_URL you set in your Cloudflare Dashboard
  const targetUrl = `${env.VITE_API_URL}/${apiPath}${url.search}`;

  // 2. Prepare headers (Injecting the Secret Key)
  const newHeaders = new Headers(request.headers);
  if (env.VITE_BLOCKSCOUT_API_KEY) {
    newHeaders.set("apikey", env.VITE_BLOCKSCOUT_API_KEY);
  }

  // 3. Fetch from Blockscout and return to your browser
  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: newHeaders,
      body: request.body
    });
    return response;
  } catch (err) {
    return new Response("Proxy Error: " + err.message, { status: 500 });
  }
}
