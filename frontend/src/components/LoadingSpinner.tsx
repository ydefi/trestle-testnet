<<<<<<< HEAD
export default function LoadingSpinner({ size = 36, label = "Loading..." }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2" role="status">
=======
export default function LoadingSpinner({ size = 40, label = "Loading..." }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
>>>>>>> 7c29aad (initial commit)
      <svg className="animate-spin text-emerald-600" width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="70 30" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
<<<<<<< HEAD
      {label && <span className="text-[10px] text-gray-500">{label}</span>}
=======
      {label && <span className="text-sm text-gray-500">{label}</span>}
>>>>>>> 7c29aad (initial commit)
    </div>
  );
}