export type TxState = "pending" | "confirmed" | "failed";

const STYLES: Record<TxState, { bg: string; label: string }> = {
  pending: { bg: "bg-amber-50 border-amber-200 text-amber-700", label: "Pending..." },
  confirmed: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "Confirmed" },
  failed: { bg: "bg-red-50 border-red-200 text-red-700", label: "Failed" },
};

export default function TxStatus({ hash, status, explorer }: { hash: string; status: TxState; explorer?: string }) {
  if (!hash) return null;
  const { bg, label } = STYLES[status] ?? STYLES.pending;
  const href = explorer ? `${explorer}/tx/${hash}` : undefined;
  return (
    <div className={`${bg} border rounded-xl p-3 mb-4 text-sm break-all`}>
      <span className="font-medium">{label}</span>{" "}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-mono">{hash.slice(0, 20)}...</a>
      ) : (
        <span className="font-mono">{hash.slice(0, 20)}...</span>
      )}
    </div>
  );
}