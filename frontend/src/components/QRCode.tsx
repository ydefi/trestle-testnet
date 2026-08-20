import { QRCodeSVG } from "qrcode.react";

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
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#059669"
        level="M"
        className="rounded"
      />
      <p className="text-center text-[9px] text-gray-400 mt-1 font-medium">
        Scan to open on mobile
      </p>
    </div>
  );
}