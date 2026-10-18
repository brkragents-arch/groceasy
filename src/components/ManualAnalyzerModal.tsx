import React, { useState } from 'react';
import type { CategoryType, Product } from '../types';
import { ProductService } from '../services/productService';
import type { LocalLLMConfig } from '../services/localLLMService';
import { 
  DEFAULT_LOCAL_LLM_CONFIG, 
  testLocalLLMConnection, 
  analyzeIngredientsWithLocalLLM 
} from '../services/localLLMService';
import { Sparkles, X, AlertCircle, Cpu, CheckCircle2, RefreshCw, Settings2 } from 'lucide-react';

interface ManualAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
}

export const ManualAnalyzerModal: React.FC<ManualAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<CategoryType>('Packaged Food');
  const [packageSize, setPackageSize] = useState('100 g');
  const [priceInr, setPriceInr] = useState<number | undefined>(199);
  const [rawIngredients, setRawIngredients] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Local LLM State
  const [llmConfig, setLlmConfig] = useState<LocalLLMConfig>(() => {
    const saved = localStorage.getItem('safescan_local_llm');
    return saved ? JSON.parse(saved) : DEFAULT_LOCAL_LLM_CONFIG;
  });
  const [showLLMSettings, setShowLLMSettings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ testing: boolean; message?: string; isConnected?: boolean }>({
    testing: false
  });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setConnectionStatus({ testing: true });
    const res = await testLocalLLMConnection(llmConfig);
    if (res.success) {
      setConnectionStatus({
        testing: false,
        isConnected: true,
        message: `Connected! Available models: ${res.models?.join(', ') || 'Default'}`
      });
      localStorage.setItem('safescan_local_llm', JSON.stringify({ ...llmConfig, enabled: true }));
      setLlmConfig(prev => ({ ...prev, enabled: true }));
    } else {
      setConnectionStatus({
        testing: false,
        isConnected: false,
        message: res.error || 'Connection failed'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!rawIngredients.trim()) {
      setError('Please provide at least one ingredient to analyze.');
      return;
    }

    setError(null);
    setAnalyzing(true);

    try {
      const service = ProductService.getInstance();
      let evaluatedIngredients: any[] | undefined = undefined;

      // If Local LLM is enabled, run local inference
      if (llmConfig.enabled) {
        evaluatedIngredients = await analyzeIngredientsWithLocalLLM(
          rawIngredients.trim(),
          category,
          llmConfig
        );
      }

      const product = service.analyzeCustomProduct({
        name: name.trim(),
        brand: brand.trim() || 'Independent Brand',
        category,
        rawIngredients: rawIngredients.trim(),
        packageSize: packageSize.trim() || 'Custom Size',
        priceInr: priceInr || undefined,
        customIngredients: evaluatedIngredients
      });

      onProductCreated(product);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred during evaluation');
    } finally {
      setAnalyzing(false);
    }
  };

  const samplePresets = [
    {
      title: 'Sample Snack with Vanaspati & MSG',
      cat: 'Packaged Food' as CategoryType,
      ingredients: 'Refined Wheat Flour, Hydrogenated Vegetable Oil (Vanaspati), Monosodium Glutamate, High Fructose Corn Syrup, Permitted Food Color INS 102'
    },
    {
      title: 'Sample Clean Niacinamide Serum',
      cat: 'Skincare' as CategoryType,
      ingredients: 'Aqua, Niacinamide (10%), Zinc PCA, Glycerin, Sodium Hyaluronate, Centella Asiatica, Phenoxyethanol'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#173D35] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Ingredient Safety Scanner</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLLMSettings(!showLLMSettings)}
              className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                llmConfig.enabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' 
                  : 'bg-white/10 text-stone-300 hover:text-white'
              }`}
              title="Local Model Settings (Ollama / Llama 3)"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{llmConfig.enabled ? 'Local AI Active' : 'Local AI Model'}</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Local LLM Settings Drawer */}
        {showLLMSettings && (
          <div className="bg-stone-900 text-stone-100 p-4 border-b border-stone-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                <Cpu className="w-4 h-4" />
                <span>Local LLM Engine (Ollama / Llama 3)</span>
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={llmConfig.enabled}
                  onChange={e => {
                    const updated = { ...llmConfig, enabled: e.target.checked };
                    setLlmConfig(updated);
                    localStorage.setItem('safescan_local_llm', JSON.stringify(updated));
                  }}
                  className="rounded accent-emerald-500"
                />
                <span>Enable Local Inference</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Ollama Host Endpoint</label>
                <input
                  type="text"
                  value={llmConfig.endpoint}
                  onChange={e => setLlmConfig({ ...llmConfig, endpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={llmConfig.model}
                  onChange={e => setLlmConfig({ ...llmConfig, model: e.target.value })}
                  placeholder="e.g. llama3, mistral, gemma2"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={connectionStatus.testing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus.testing ? 'animate-spin' : ''}`} />
                <span>Test Local Connection</span>
              </button>

              <span className="text-[11px] text-stone-400">
                Run <code className="text-emerald-300">ollama run llama3</code> in terminal
              </span>
            </div>

            {connectionStatus.message && (
              <div className={`text-xs p-2 rounded-xl flex items-center gap-2 ${
                connectionStatus.isConnected 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}>
                {connectionStatus.isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span className="truncate">{connectionStatus.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-stone-600">
            Paste the raw ingredient declaration to evaluate against Indian FSSAI, ICMR-NIN & BIS safety standards {llmConfig.enabled ? 'using your local LLM' : 'using the local rule engine'}.
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Product Name</label>
              <input
                type="text"
                placeholder="e.g. Masala Oats"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. Saffola"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
              >
                <option value="Packaged Food">Packaged Food</option>
                <option value="Dairy & Beverages">Dairy & Beverages</option>
                <option value="Staples & Grocery">Staples & Grocery</option>
                <option value="Skincare">Skincare</option>
                <option value="Haircare">Haircare</option>
                <option value="Personal Care">Personal Care</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Size / Quantity</label>
              <input
                type="text"
                placeholder="e.g. 200 g"
                value={packageSize}
                onChange={e => setPackageSize(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Price (₹ INR)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={priceInr || ''}
                onChange={e => setPriceInr(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Raw Ingredients List (Comma-separated)
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Water, Whole Wheat, Hydrogenated Vegetable Oil, Sugar, Added Flavours, Sodium Benzoate..."
              value={rawIngredients}
              onChange={e => setRawIngredients(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#173D35] outline-none"
              required
            />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Or Try a Sample Preset:
            </span>
            <div className="flex flex-col gap-1.5">
              {samplePresets.map((preset, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setName(preset.title);
                    setCategory(preset.cat);
                    setRawIngredients(preset.ingredients);
                  }}
                  className="text-left text-xs bg-stone-100 hover:bg-stone-200 p-2 rounded-xl text-stone-800 transition-colors"
                >
                  <span className="font-semibold block">{preset.title}</span>
                  <span className="text-[11px] text-stone-500 line-clamp-1">{preset.ingredients}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3 bg-[#173D35] text-white font-bold rounded-2xl text-xs hover:bg-[#0f2b25] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Evaluating with {llmConfig.enabled ? `Local LLM (${llmConfig.model})` : 'Local Safety Engine'}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Analyze & Calculate Safety Score {llmConfig.enabled ? '(Local AI)' : ''}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
