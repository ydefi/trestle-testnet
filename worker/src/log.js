export async function writeLog(db, { worker = "vault", level = "error", message, source = "", details = "", url = "", user = "" }) {
  try {
    const ts = Math.floor(Date.now() / 1000);
    await db.prepare(
      "INSERT INTO worker_logs (worker, level, message, source, details, url, user, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(worker, level, (message || "").slice(0, 500), source, (details || "").slice(0, 2000), url || "", user || "", ts).run();
  } catch (e) {
    console.error("Failed to write log:", e.message);
  }
}