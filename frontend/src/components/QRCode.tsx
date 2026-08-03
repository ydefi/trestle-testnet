const SITE_URL = "https://testnet.trestle.website";

export default function QRCode({
  value = SITE_URL,
  size = 160,
}: {
  value?: string;
  size?: number;
}) {
  return (
    <div className="bg-white p-2 rounded-lg shadow border border-gray-200 inline-block">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=059669&bgcolor=ffffff&ecc=M`}
        alt="QR Code"
        width={size}
        height={size}
        className="rounded"
      />
      <p className="text-center text-[9px] text-gray-400 mt-1 font-medium">
        Scan to open on mobile
      </p>
    </div>
  );
}
