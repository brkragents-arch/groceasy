import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { getProductIllustration } from '../utils/productIllustration';
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
  HeartHandshake,
  ShieldCheck
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

  const isToothpasteOrOral = 
    /tooth\s*paste|dental|enamel|dente|dentifrice|mouthwash|oral|brush/i.test(product.name) ||
    /tooth\s*paste|dental|enamel|dente|dentifrice|mouthwash|oral/i.test(product.subcategory || '') ||
    /tooth\s*paste|dental|enamel|dente|dentifrice|oral/i.test(product.brand || '');

  const isCosmetic = isToothpasteOrOral ||
    product.category === 'Personal Care' ||
    product.category === 'Haircare' ||
    product.category === 'Skincare' ||
    product.category === 'PERSONAL_CARE' ||
    /cosmetic|toothpaste|dental|shampoo|soap|lotion|cream|serum|sunscreen|cleanser|facewash/i.test(product.subcategory || '') ||
    /cosmetic|toothpaste|dental|shampoo|soap|lotion|cream|serum|sunscreen|cleanser|facewash/i.test(product.name);

  return (
    <div className="min-h-screen bg-[#F8F9F7] pb-24 animate-fadeIn">
      {/* Top Navbar with 1-inch desktop margins */}
      <div className="sticky top-0 z-30 bg-[#173D35] text-white px-4 sm:px-8 lg:px-[1in] py-3.5 flex items-center justify-between shadow-md">
        <button 
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2 transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to Products</span>
        </button>

        <span className="text-sm sm:text-base font-bold tracking-wide">Product Safety Analysis Report</span>

        <div className="flex items-center gap-2">
          {onToggleSave && (
            <button 
              onClick={() => onToggleSave(product)}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isSaved ? 'bg-white text-[#173D35]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-[1in] pt-6 space-y-6">
        {/* Product Hero Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-5 items-center">
          <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-inner p-2 border border-stone-100 flex items-center justify-center">
            <img 
              src={product.thumbnailUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = getProductIllustration(product);
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

        {/* Two-Column Responsive Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Safety Score & Critical Alerts */}
          <div className="space-y-6">
            {/* Transparent Safety Score Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">SafeScan Safety Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#173D35]">
                      {product.safetyAssessment.score.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-stone-500">/ 10</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badge.bg} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">Evidence Confidence</span>
                  <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                    {product.safetyAssessment.confidence}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mt-3.5">
                {product.safetyAssessment.explanation}
              </p>

              {/* Breakdown bars */}
              <div className="mt-5 space-y-3">
                <span className="text-xs font-bold text-stone-800 block uppercase tracking-wider">Scoring Breakdown</span>
                {product.safetyAssessment.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-stone-800">{item.label} ({item.weight}%)</span>
                      <span className="font-bold text-[#173D35]">{item.score}/10</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#173D35] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.score * 10}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Ingredients Summary Alerts */}
            {(redFlags.length > 0 || amberFlags.length > 0) && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Ingredients Requiring Attention ({redFlags.length + amberFlags.length})</span>
                </div>

                <div className="space-y-2.5">
                  {redFlags.map((ing, i) => (
                    <div key={i} className="bg-white/95 rounded-2xl p-3.5 border border-rose-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          {ing.name}
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                          High Concern
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 mt-1.5">{ing.reason}</p>
                      <p className="text-[11px] text-stone-500 mt-1 italic">Source: {ing.source}</p>
                      {ing.recommendation && (
                        <p className="text-[11px] text-[#173D35] font-semibold mt-1.5 bg-emerald-50/80 p-2 rounded-xl">
                          💡 {ing.recommendation}
                        </p>
                      )}
                    </div>
                  ))}

                  {amberFlags.map((ing, i) => (
                    <div key={i} className="bg-white/95 rounded-2xl p-3.5 border border-amber-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          {ing.name}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          Moderate Caution
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 mt-1.5">{ing.reason}</p>
                      <p className="text-[11px] text-stone-500 mt-1 italic">Source: {ing.source}</p>
                      {ing.recommendation && (
                        <p className="text-[11px] text-[#173D35] font-semibold mt-1.5 bg-emerald-50/80 p-2 rounded-xl">
                          💡 {ing.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Nutrition / Suitability & Complete Ingredients */}
          <div className="space-y-6">
            {/* Nutritional Facts Card - Suppressed for cosmetics and oral care */}
            {!isCosmetic && product.nutritionFacts && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900">Nutrition Facts</h3>
                  <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                    Per {product.nutritionFacts.servingSize || 'Serving'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Energy</span>
                    <span className="text-sm font-bold text-stone-800">{product.nutritionFacts.energyKcal || 0} kcal</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Added Sugar</span>
                    <span className={`text-sm font-bold ${(product.nutritionFacts.addedSugarG ?? 0) > 10 ? 'text-rose-600' : 'text-stone-800'}`}>
                      {product.nutritionFacts.addedSugarG ?? 0}g
                    </span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Sodium</span>
                    <span className={`text-sm font-bold ${(product.nutritionFacts.sodiumMg ?? 0) > 400 ? 'text-amber-600' : 'text-stone-800'}`}>
                      {product.nutritionFacts.sodiumMg ?? 0}mg
                    </span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Trans Fat</span>
                    <span className={`text-sm font-bold ${(product.nutritionFacts.transFatG ?? 0) > 0 ? 'text-rose-600' : 'text-stone-800'}`}>
                      {product.nutritionFacts.transFatG ?? 0}g
                    </span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Dietary Fiber</span>
                    <span className="text-sm font-bold text-emerald-700">{product.nutritionFacts.fiberG ?? 0}g</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl text-center border border-stone-100">
                    <span className="text-[11px] text-stone-500 block font-medium">Protein</span>
                    <span className="text-sm font-bold text-emerald-700">{product.nutritionFacts.proteinG ?? 0}g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Oral & Dental Formulation Profile (Specialized for Toothpastes & Oral Care) */}
            {isToothpasteOrOral && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-base">
                      🦷
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Oral & Dental Formulation Profile</h3>
                      <p className="text-[11px] text-stone-500">Cosmetic Dentifrice Formulation (BIS IS:6356 / IS:4707)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Cosmetic Oral Care
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs mb-3.5">
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Remineralization Active</span>
                    <span className="font-bold text-teal-900 block mt-0.5">Nano-Hydroxyapatite</span>
                    <span className="text-[10px] text-teal-700">Biomimetic enamel repair & desensitization</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Bio-Defense Shield</span>
                    <span className="font-bold text-teal-900 block mt-0.5">Lactoferrin Protein</span>
                    <span className="text-[10px] text-teal-700">Natural salivary defense against oral bacteria</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Surfactant Safety</span>
                    <span className="font-bold text-emerald-800 block mt-0.5">100% SLS-Free</span>
                    <span className="text-[10px] text-emerald-700">Gentle coconut cleansers (Ulcer-safe)</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Enamel Abrasivity</span>
                    <span className="font-bold text-stone-800 block mt-0.5">Hydrated Silica (Low RDA)</span>
                    <span className="text-[10px] text-stone-600">Gentle stain lift without enamel wear</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Fluoride Status</span>
                    <span className="font-bold text-stone-800 block mt-0.5">Fluoride-Free Formula</span>
                    <span className="text-[10px] text-stone-600">Biomimetic calcium phosphate active</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Cariogenic Safety</span>
                    <span className="font-bold text-emerald-800 block mt-0.5">0% Added Sugars</span>
                    <span className="text-[10px] text-emerald-700">Non-fermentable polyol sweetening</span>
                  </div>
                </div>

                <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3 text-[11px] text-teal-950 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Indian Cosmetic Dentifrice Mandate:</span> Toothpastes in India are classified as cosmetics under the Drugs and Cosmetics Act and evaluated against BIS IS:6356. They do not carry nutritional calories or food facts; SafeScan assesses oral mucosal tolerance, abrasive safety, and remineralization efficacy.
                  </p>
                </div>
              </div>
            )}

            {/* Skin Suitability Card for Skincare/Haircare Cosmetics */}
            {!isToothpasteOrOral && product.skinSuitability && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-3">Dermatological & Skin Compatibility</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-stone-500">Recommended For</span>
                    <span className="font-bold text-stone-800">{product.skinSuitability.skinTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-stone-500">Comedogenic Potential</span>
                    <span className="font-bold text-stone-800">
                      {product.skinSuitability.comedogenicRating ? `${product.skinSuitability.comedogenicRating} / 5 (Pore safety)` : 'Non-comedogenic'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-stone-500">Fragrance Free</span>
                    <span className={`font-bold ${product.skinSuitability.fragranceFree ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {product.skinSuitability.fragranceFree ? 'Yes (Hypoallergenic)' : 'No (Contains added fragrance)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-stone-500">Sulfate Free</span>
                    <span className={`font-bold ${product.skinSuitability.sulfateFree ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {product.skinSuitability.sulfateFree ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Itemized Ingredient Roster & Chemical Risk Analysis */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Complete Ingredient Roster & Chemical Analysis</h3>
                  <p className="text-[11px] text-stone-500">
                    Itemized toxicological screening against BIS IS:4707, BIS IS:6356 & scientific safety benchmarks
                  </p>
                </div>
                <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                  {product.ingredients.length} Ingredients
                </span>
              </div>
              {/* Roster Badges Quick View */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50/80 rounded-2xl border border-stone-100 mb-3.5">
                {product.ingredients.map((ing, index) => {
                  let dotColor = 'bg-emerald-500';
                  let badgeBg = 'bg-emerald-50 text-emerald-900 border-emerald-200';
                  if (ing.risk === 'red') {
                    dotColor = 'bg-rose-500';
                    badgeBg = 'bg-rose-50 text-rose-900 border-rose-300 font-bold';
                  } else if (ing.risk === 'amber') {
                    dotColor = 'bg-amber-500';
                    badgeBg = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
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

              {/* Comprehensive Itemized Chemical Risk & Scientific Details */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                {product.ingredients.map((ing, idx) => {
                  let statusBadge = (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Safe / Active
                    </span>
                  );
                  let cardBorder = 'border-stone-200 bg-stone-50/50';

                  if (ing.risk === 'red') {
                    statusBadge = (
                      <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                        High Concern
                      </span>
                    );
                    cardBorder = 'border-rose-200 bg-rose-50/30';
                  } else if (ing.risk === 'amber') {
                    statusBadge = (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        Moderate Caution
                      </span>
                    );
                    cardBorder = 'border-amber-200 bg-amber-50/30';
                  }

                  return (
                    <div key={idx} className={`p-3.5 rounded-2xl border text-xs ${cardBorder} transition-all`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${ing.risk === 'red' ? 'bg-rose-500' : ing.risk === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="font-bold text-stone-900 text-xs sm:text-sm">{ing.name}</span>
                        </div>
                        {statusBadge}
                      </div>

                      {ing.concernType && (
                        <span className="inline-block text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md mb-1.5">
                          Category: {ing.concernType}
                        </span>
                      )}

                      <p className="text-xs text-stone-700 leading-relaxed mt-1">
                        {ing.reason}
                      </p>

                      <div className="mt-2 pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-500">
                        <span className="italic">
                          Scientific Standard: <strong className="text-stone-700">{ing.source}</strong>
                        </span>
                        {ing.recommendation && (
                          <span className="text-teal-800 font-medium">
                            ✓ {ing.recommendation}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Produce Traceability */}
            {product.freshnessTraceability && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-2">Traceability & Freshness</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Farm Origin</span>
                    <span className="font-bold text-stone-800">{product.freshnessTraceability.origin}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Cultivation Standard</span>
                    <span className="font-bold text-emerald-700">{product.freshnessTraceability.farmingType}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-stone-500">Estimated Shelf Life</span>
                    <span className="font-bold text-stone-800">{product.freshnessTraceability.shelfLifeDays} Days</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification and Trust Disclaimers */}
        <div className="bg-stone-100/80 rounded-2xl p-4 text-[11px] text-stone-600 leading-relaxed border border-stone-200">
          <p className="flex items-center gap-1.5 font-bold text-stone-800 mb-1">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>Verification Source & Scientific Reference</span>
          </p>
          <p>
            Data Source: {product.dataSource}. Last assessed: {product.lastUpdated}.
          </p>
          <p className="mt-1">
            This screening report is for informational and educational comparison based on published scientific guidelines (FSSAI, ICMR-NIN 2024, BIS IS:4707). It does not constitute medical diagnosis, allergy prevention, or formal safety certification.
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
