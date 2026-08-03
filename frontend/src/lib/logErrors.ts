const LOG_URL = import.meta.env.VITE_API_URL || "https://reward.trestle.website";

export function initErrorLogging() {
  if (typeof window === "undefined") return;

  const origError = window.onerror;
  window.onerror = (msg, source, lineno, colno, error) => {
    fetch(`${LOG_URL}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker: "mini-app-frontend",
        level: "error",
        message: String(msg || ""),
        details: error?.stack || "",
        url: source || "",
        user: "",
      }),
    }).catch(() => {});
    origError?.call(window, msg, source, lineno, colno, error);
  };

  const origRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    fetch(`${LOG_URL}/api/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker: "mini-app-frontend",
        level: "error",
        message: String(reason?.message || reason || ""),
        details: reason?.stack || "",
      }),
    }).catch(() => {});
    origRejection?.call(window, event);
  };
}
