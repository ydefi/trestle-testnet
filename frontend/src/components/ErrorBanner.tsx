export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-start justify-between gap-2" role="alert">
      <span className="break-words">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-600 font-medium" aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}