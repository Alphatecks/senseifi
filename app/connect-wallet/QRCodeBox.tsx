
"use client";
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeBox({ value }: { value: string }) {
  return (
    <div className="bg-white p-2 rounded-lg mb-2">
      <QRCodeSVG value={value} size={128} fgColor="#181C23" bgColor="#fff" includeMargin={false} />
    </div>
  );
}
