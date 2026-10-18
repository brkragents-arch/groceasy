import React, { useState, useRef, useEffect } from 'react';
import type { Product } from '../types';
import { ProductService } from '../services/productService';
import { 
  Camera, 
  ScanLine, 
  Upload, 
  Search, 
  AlertCircle, 
  X, 
  HelpCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
  onManualAnalyze: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
  onManualAnalyze
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Common Indian barcode samples for quick testing
  const SAMPLE_BARCODES = [
    { label: 'True Elements Oats', code: '8901030910012' },
    { label: 'CrazeBites Biscuits', code: '8901499010203' },
    { label: 'Organic Spinach', code: '8906010010099' },
    { label: 'Ceramide Moisturizer', code: '8906087790111' },
    { label: 'PureRoots Mustard Oil', code: '8902500119922' }
  ];

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    setScanStatus('Align barcode within the center frame...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming is not supported on this browser or connection.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(err.message || 'Camera permission denied or camera unavailable.');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const handleLookup = async (codeToLookup: string) => {
    const clean = codeToLookup.trim();
    if (!clean) return;

    setScanStatus(`Searching product for EAN: ${clean}...`);
    const service = ProductService.getInstance();
    const product = await service.getByBarcode(clean);

    if (product) {
      setScanStatus('Product found! Loading analysis...');
      setTimeout(() => {
        stopCamera();
        onProductFound(product);
        onClose();
      }, 500);
    } else {
      setScanStatus(null);
      setCameraError(`No verified product registered for barcode: "${clean}".`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#173D35] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Scan Retail Barcode</h3>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'camera' 
                ? 'bg-white text-[#173D35] border-b-2 border-[#173D35]' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'manual' 
                ? 'bg-white text-[#173D35] border-b-2 border-[#173D35]' 
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Manual EAN / Barcode</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'camera' ? (
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-stone-950 rounded-2xl overflow-hidden flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-white space-y-3">
                    <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                    <p className="text-xs text-stone-300">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium"
                    >
                      Retry Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      playsInline 
                      muted 
                    />
                    {/* Viewfinder Target */}
                    <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-rose-500/80 animate-pulse" />
                    </div>
                  </>
                )}
              </div>

              {scanStatus && (
                <div className="text-xs text-center text-stone-600 bg-stone-100 p-2.5 rounded-xl font-medium">
                  {scanStatus}
                </div>
              )}

              <p className="text-[11px] text-stone-500 text-center">
                Supports retail EAN-13, EAN-8, UPC-A barcodes on Indian FMCG groceries and cosmetic packages.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Enter 12-13 Digit Barcode (EAN / UPC)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 8901030910012"
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#173D35]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLookup(manualCode);
                    }}
                  />
                  <button
                    onClick={() => handleLookup(manualCode)}
                    className="bg-[#173D35] text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-[#0f2b25] transition-colors"
                  >
                    Lookup
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-start gap-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Custom manual analysis trigger */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#173D35] mb-1">
                  <FileText className="w-4 h-4" />
                  <span>Product not in database?</span>
                </div>
                <p className="text-[11px] text-stone-600 mb-2">
                  Paste the ingredient text directly to run the real-time SafeScan analysis engine.
                </p>
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                    onManualAnalyze();
                  }}
                  className="w-full py-2 bg-[#173D35] text-white rounded-xl text-xs font-semibold hover:bg-[#0f2b25] transition-colors"
                >
                  Analyze Custom Ingredients
                </button>
              </div>
            </div>
          )}

          {/* Quick Test Barcodes */}
          <div className="pt-2 border-t border-stone-100">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              Quick Test Indian FMCG Products:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_BARCODES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLookup(item.code)}
                  className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-[#173D35] hover:text-white text-stone-700 text-xs font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
