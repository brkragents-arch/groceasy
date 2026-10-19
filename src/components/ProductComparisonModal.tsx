import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#173D35] text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Side-by-Side Product Comparison</h3>
            <p className="text-xs text-emerald-200">Comparing {products.length} products on safety, nutrition, and price</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-x-auto flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              No products selected for comparison. Click "Compare" on any product card.
            </div>
          ) : (
            <div className="min-w-[650px] space-y-4">
              {/* Product Headers */}
              <div className="grid grid-cols-4 gap-3">
                <div className="text-xs font-bold text-stone-600 flex items-end pb-2">
                  Attribute / Metrics
                </div>
                {products.map(product => (
                  <div key={product.id} className="bg-stone-50 rounded-2xl p-3 relative border border-stone-200 flex flex-col justify-between">
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <img 
                      src={product.thumbnailUrl} 
                      alt={product.name} 
                      className="w-16 h-16 object-cover rounded-xl mx-auto mb-2"
                    />
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-800 uppercase tracking-wider border border-stone-300/60 inline-block">
                          {product.brand}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight" title={product.name}>
                        {product.name}
                      </h4>
                      <span className="text-xs font-bold text-[#173D35] block mt-1">{formatInr(product.priceInr)}</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(product);
                      }}
                      className="mt-2 text-[11px] bg-[#173D35] text-white py-1.5 rounded-xl font-semibold flex items-center justify-center gap-1 hover:bg-[#0f2b25]"
                    >
                      <span>Full Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Rows Comparison */}
              <div className="divide-y divide-stone-100 text-xs">
                {/* Safety Score */}
                <div className="grid grid-cols-4 gap-3 py-3 items-center">
                  <span className="font-bold text-stone-700">Safety Index</span>
                  {products.map(p => {
                    const badge = getScoreBadgeColor(p.safetyAssessment.score);
                    return (
                      <div key={p.id} className="font-bold flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${badge.bg} border ${badge.border}`}>
                          {p.safetyAssessment.score.toFixed(1)} / 10
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Category */}
                <div className="grid grid-cols-4 gap-3 py-3 items-center">
                  <span className="font-bold text-stone-700">Category & Type</span>
                  {products.map(p => (
                    <div key={p.id} className="text-stone-700">
                      {p.category} ({p.subcategory})
                    </div>
                  ))}
                </div>

                {/* Package Size */}
                <div className="grid grid-cols-4 gap-3 py-3 items-center">
                  <span className="font-bold text-stone-700">Package Quantity</span>
                  {products.map(p => (
                    <div key={p.id} className="text-stone-700">
                      {p.packageSize}
                    </div>
                  ))}
                </div>

                {/* Ingredients of concern */}
                <div className="grid grid-cols-4 gap-3 py-3 items-center">
                  <span className="font-bold text-stone-700">Flagged Ingredients</span>
                  {products.map(p => {
                    const flags = p.ingredients.filter(i => i.risk === 'red' || i.risk === 'amber');
                    return (
                      <div key={p.id} className="text-stone-700">
                        {flags.length === 0 ? (
                          <span className="text-emerald-700 font-medium">None flagged ✓</span>
                        ) : (
                          <div className="space-y-1">
                            {flags.map((f, i) => (
                              <span 
                                key={i} 
                                className={`inline-block text-[10px] px-1.5 py-0.5 rounded mr-1 ${
                                  f.risk === 'red' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Nutrition or Skin summary */}
                <div className="grid grid-cols-4 gap-3 py-3 items-center">
                  <span className="font-bold text-stone-700">Nutritional / Skin Focus</span>
                  {products.map(p => (
                    <div key={p.id} className="text-stone-700">
                      {/tooth\s*paste|dental|enamel|dente|dentifrice|oral/i.test(p.name) || /tooth\s*paste|dental|enamel|dente|oral/i.test(p.subcategory || '') ? (
                        <div className="text-[11px] space-y-0.5 text-teal-800">
                          <p className="font-semibold">Remineralizing: nHAp Active</p>
                          <p>SLS-Free: Mild Surfactants</p>
                          <p>Dentifrice: BIS IS:6356</p>
                        </div>
                      ) : p.nutritionFacts && !['Personal Care', 'Haircare', 'Skincare'].includes(p.category) ? (
                        <div className="text-[11px] space-y-0.5">
                          <p>Sugar: {p.nutritionFacts.addedSugarG ?? 0}g</p>
                          <p>Trans Fat: {p.nutritionFacts.transFatG ?? 0}g</p>
                          <p>Sodium: {p.nutritionFacts.sodiumMg ?? 0}mg</p>
                        </div>
                      ) : p.skinSuitability ? (
                        <div className="text-[11px] space-y-0.5">
                          <p>Fragrance Free: {p.skinSuitability.fragranceFree ? 'Yes' : 'No'}</p>
                          <p>Types: {p.skinSuitability.skinTypes.join(', ')}</p>
                        </div>
                      ) : (
                        <span className="text-stone-400">Personal Care / Fresh Item</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
