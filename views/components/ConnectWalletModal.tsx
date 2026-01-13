import React from 'react';

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" style={{ backgroundImage: 'url(/images/bg-connect-wallet.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-black bg-opacity-60 border border-blue-500 shadow-xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
        {/* Logo and Title */}
        <div className="flex items-center mb-6">
          <img src="/images/icons/senseifi-logo.png" alt="SenseiFi Logo" className="w-8 h-8 mr-2" />
          <span className="text-white text-lg font-semibold">Connect Wallet</span>
        </div>
        {/* Wallet Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between bg-blue-800 bg-opacity-60 rounded-lg px-4 py-3 border border-blue-400">
            <div className="flex items-center">
              <img src="/images/icons/metamask.png" alt="MetaMask" className="w-7 h-7 mr-2" />
              <span className="text-blue-200 font-medium">MetaMask <span className="text-xs text-blue-300 ml-1">(Recommended)</span></span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition">Connect</button>
          </div>
          <div className="flex items-center justify-between bg-gray-800 bg-opacity-60 rounded-lg px-4 py-3 border border-gray-600">
            <div className="flex items-center">
              <img src="/images/icons/coinbase.png" alt="Coinbase Wallet" className="w-7 h-7 mr-2" />
              <span className="text-white font-medium">Coinbase Wallet</span>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded transition">Connect</button>
          </div>
        </div>
        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-gray-700" />
          <span className="mx-3 text-gray-400">OR</span>
          <div className="flex-grow h-px bg-gray-700" />
        </div>
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-2 rounded-lg mb-2">
            <img src="/images/icons/sample-qr.png" alt="QR Code" className="w-32 h-32" />
          </div>
          <span className="text-gray-300 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M19 13V7a2 2 0 00-2-2h-6M5 7V5a2 2 0 012-2h6m-6 0v2m0 0H7m0 0v2" /></svg>
            Scan Code to connect
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
