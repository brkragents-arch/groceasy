import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { 
  ArrowLeft, 
  ExternalLink, 
  Bookmark, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Info, 
  ShieldAlert,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  isSaved?: boolean;
  onToggleSave?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  isSaved = false,
  onToggleSave,
  onCompare,
  isComparing = false
}) => {
  const badge = getScoreBadgeColor(product.safetyAssessment.score);
  const redFlags = product.ingredients.filter(i => i.risk === 'red');
  const amberFlags = product.ingredients.filter(i => i.risk === 'amber');

  return (
    <div className="min-h-screen bg-[#F8F9F7] pb-24 animate-fadeIn">
      {/* Top Navbar */}
      <div className="sticky top-0 z-30 bg-[#173D35] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <span className="text-sm font-semibold tracking-wide">Product Safety Analysis</span>

        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button 
              onClick={() => onToggleSave(product)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isSaved ? 'bg-white text-[#173D35]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Product Hero Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-5 items-center">
          <div className="w-40 h-40 bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
            <img 
              src={product.thumbnailUrl} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                import('../utils/productIllustration').then(({ getProductIllustration }) => {
                  target.src = getProductIllustration(product.name, product.subcategory, product.brand);
                });
              }}
            />
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#173D35] text-white shadow-xs uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200/60">
                {product.category} • {product.subcategory}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-stone-900 leading-snug">{product.name}</h1>
            <p className="text-xs font-medium text-stone-600 mt-1">Pack Size: {product.packageSize}</p>

            <div className="mt-3 flex items-center justify-center md:justify-start gap-4">
              <div>
                <span className="text-[11px] text-stone-600 block">Current Price</span>
                <span className="text-lg font-bold text-[#173D35]">{formatInr(product.priceInr)}</span>
              </div>

              {product.retailerUrl && (
                <a 
                  href={product.retailerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-medium border border-amber-200 transition-colors"
                >
                  <span>Amazon India</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Transparent Safety Score Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">SafeScan Safety Index</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-[#173D35]">
                  {product.safetyAssessment.score.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-stone-600">/ 10</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.border}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-stone-600 block">Evidence Confidence</span>
              <span className="text-xs font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                {product.safetyAssessment.confidence}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed mt-3">
            {product.safetyAssessment.explanation}
          </p>

          {/* Breakdown bars */}
          <div className="mt-4 space-y-2.5">
            <span className="text-xs font-semibold text-stone-700 block">Scoring Breakdown</span>
            {product.safetyAssessment.breakdown.map((item, idx) => (
              <div key={idx} className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                <div className="flex justify-between items-center text-xs font-medium mb-1">
                  <span className="text-stone-800">{item.label} ({item.weight}%)</span>
                  <span className="font-bold text-[#173D35]">{item.score}/10</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#173D35] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-600 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Ingredients Summary Alerts */}
        {(redFlags.length > 0 || amberFlags.length > 0) && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Ingredients Requiring Attention ({redFlags.length + amberFlags.length})</span>
            </div>

            <div className="space-y-2 mt-2">
              {redFlags.map((ing, i) => (
                <div key={i} className="bg-white/90 rounded-2xl p-3 border border-rose-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      {ing.name}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-medium">
                      High Concern
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 mt-1">{ing.reason}</p>
                  <p className="text-[11px] text-stone-600 mt-1 italic">Source: {ing.source}</p>
                  {ing.recommendation && (
                    <p className="text-[11px] text-[#173D35] font-medium mt-1 bg-emerald-50/80 p-1.5 rounded-lg">
                      💡 {ing.recommendation}
                    </p>
                  )}
                </div>
              ))}

              {amberFlags.map((ing, i) => (
                <div key={i} className="bg-white/90 rounded-2xl p-3 border border-amber-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      {ing.name}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      Moderate / Caution
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 mt-1">{ing.reason}</p>
                  <p className="text-[11px] text-stone-600 mt-1 italic">Source: {ing.source}</p>
                  {ing.recommendation && (
                    <p className="text-[11px] text-[#173D35] font-medium mt-1 bg-emerald-50/80 p-1.5 rounded-lg">
                      💡 {ing.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Itemized Ingredient List */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-stone-900">Complete Ingredient Roster</h3>
            <span className="text-xs text-stone-600">{product.ingredients.length} items</span>
          </div>

          <p className="text-[11px] text-stone-600 mb-3">
            Color-coded based on evaluated evidence: <span className="text-emerald-700 font-semibold">● Favorable</span>, <span className="text-amber-700 font-semibold">● Caution</span>, <span className="text-rose-700 font-semibold">● Concern</span>.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {product.ingredients.map((ing, index) => {
              let dotColor = 'bg-emerald-500';
              let badgeBg = 'bg-emerald-50 text-emerald-900 border-emerald-200';
              if (ing.risk === 'red') {
                dotColor = 'bg-rose-500';
                badgeBg = 'bg-rose-50 text-rose-900 border-rose-300 font-semibold';
              } else if (ing.risk === 'amber') {
                dotColor = 'bg-amber-500';
                badgeBg = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
              } else if (ing.risk === 'grey') {
                dotColor = 'bg-stone-400';
                badgeBg = 'bg-stone-50 text-stone-700 border-stone-200';
              }

              return (
                <div 
                  key={index} 
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${badgeBg}`}
                  title={ing.reason}
                >
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span>{ing.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nutritional Facts or Skin Suitability Card */}
        {product.nutritionFacts && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-2">Nutrition Facts (Per {product.nutritionFacts.servingSize || 'Serving'})</h3>
            <div className="grid grid-cols-3 gap-2.5 mt-3">
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Energy</span>
                <span className="text-sm font-bold text-stone-800">{product.nutritionFacts.energyKcal || 0} kcal</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Added Sugar</span>
                <span className={`text-sm font-bold ${(product.nutritionFacts.addedSugarG ?? 0) > 10 ? 'text-rose-600' : 'text-stone-800'}`}>
                  {product.nutritionFacts.addedSugarG ?? 0}g
                </span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Sodium</span>
                <span className={`text-sm font-bold ${(product.nutritionFacts.sodiumMg ?? 0) > 400 ? 'text-amber-600' : 'text-stone-800'}`}>
                  {product.nutritionFacts.sodiumMg ?? 0}mg
                </span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Trans Fat</span>
                <span className={`text-sm font-bold ${(product.nutritionFacts.transFatG ?? 0) > 0 ? 'text-rose-600' : 'text-stone-800'}`}>
                  {product.nutritionFacts.transFatG ?? 0}g
                </span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Dietary Fiber</span>
                <span className="text-sm font-bold text-emerald-700">{product.nutritionFacts.fiberG ?? 0}g</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-2xl text-center">
                <span className="text-[11px] text-stone-600 block">Protein</span>
                <span className="text-sm font-bold text-emerald-700">{product.nutritionFacts.proteinG ?? 0}g</span>
              </div>
            </div>
          </div>
        )}

        {/* Skin Suitability Card for Cosmetics */}
        {product.skinSuitability && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-2">Dermatological & Skin Compatibility</h3>
            <div className="space-y-2 mt-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                <span className="text-stone-600">Recommended For</span>
                <span className="font-semibold text-stone-800">{product.skinSuitability.skinTypes.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                <span className="text-stone-600">Comedogenic Potential</span>
                <span className="font-semibold text-stone-800">
                  {product.skinSuitability.comedogenicRating ? `${product.skinSuitability.comedogenicRating} / 5 (Low clog risk)` : 'Non-comedogenic'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
                <span className="text-stone-600">Fragrance Free</span>
                <span className={`font-semibold ${product.skinSuitability.fragranceFree ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {product.skinSuitability.fragranceFree ? 'Yes (Hypoallergenic)' : 'No (Contains added Parfum)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-stone-600">Sulfate / Harsh Surfactant Free</span>
                <span className={`font-semibold ${product.skinSuitability.sulfateFree ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {product.skinSuitability.sulfateFree ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Produce Traceability */}
        {product.freshnessTraceability && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 mb-2">Traceability & Freshness</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600">Farm Origin</span>
                <span className="font-semibold text-stone-800">{product.freshnessTraceability.origin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-600">Cultivation Standard</span>
                <span className="font-semibold text-emerald-700">{product.freshnessTraceability.farmingType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-600">Estimated Shelf Life</span>
                <span className="font-semibold text-stone-800">{product.freshnessTraceability.shelfLifeDays} Days</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification and Trust Disclaimers */}
        <div className="bg-stone-100/70 rounded-2xl p-3.5 text-[11px] text-stone-600 leading-relaxed border border-stone-200">
          <p className="flex items-center gap-1 font-semibold text-stone-700 mb-1">
            <Info className="w-3.5 h-3.5 text-stone-500" />
            <span>Verification Source & Legal Disclaimer</span>
          </p>
          <p>
            Data Source: {product.dataSource}. Last assessed: {product.lastUpdated}.
          </p>
          <p className="mt-1">
            This screening report is for informational and educational comparison based on published scientific guidelines (FSSAI, WHO, BIS IS:4707). It does not constitute medical diagnosis, allergy prevention, or formal safety certification.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="pt-2 flex gap-3">
          {onCompare && (
            <button
              onClick={() => onCompare(product)}
              className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                isComparing 
                  ? 'bg-stone-200 text-stone-800' 
                  : 'bg-white border border-[#173D35] text-[#173D35] hover:bg-stone-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isComparing ? 'Remove from Compare' : 'Add to Compare'}</span>
            </button>
          )}

          {product.retailerUrl && (
            <a
              href={product.retailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-2xl bg-[#173D35] text-white font-semibold text-sm hover:bg-[#0f2b25] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>View on Amazon India</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
