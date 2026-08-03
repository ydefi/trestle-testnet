import { useState } from "react";

export default function QRIcon({ value = "https://testnet.trestle.website", size = 80 }: { value?: string; size?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center gap-1 cursor-pointer group"
        aria-label="Show QR code"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">📱</span>
        <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">Scan for mobile</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-gray-800 text-white rounded-full text-sm flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">📱</span>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=${Math.min(size * 2, 280)}x${Math.min(size * 2, 280)}&data=${encodeURIComponent(value)}&color=059669&bgcolor=ffffff&ecc=M`}
                alt="QR Code"
                width={Math.min(size * 2, 280)}
                height={Math.min(size * 2, 280)}
                className="rounded-lg"
              />
              <span className="text-xs text-gray-500 font-medium">Scan to open on mobile</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
