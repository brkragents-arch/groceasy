import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { getProductIllustration } from '../utils/productIllustration';
import { calculateSafetyScore } from '../services/scoringEngine';
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
  const isToothpasteOrOral = 
    /tooth\s*paste|dental|enamel|dente|dentifrice|mouthwash|oral|brush/i.test(product.name) ||
    /tooth\s*paste|dental|enamel|dente|dentifrice|mouthwash|oral/i.test(product.subcategory || '') ||
    /tooth\s*paste|dental|enamel|dente|dentifrice|oral/i.test(product.brand || '') ||
    product.ingredients.some(i => /hydroxyapatite|nhap|silica|lactoferrin|dentifrice|fluoride|toothpaste/i.test(i.name));

  const isHairColorOrDye = 
    /hair\s*colou?r|hair\s*dye|henna|mehndi|mehendi|indigo\s*powder|cr[eè]me\s*gloss|salon\s*secret|godrej\s*expert|excellence\s*cr|botanical\s*color/i.test(product.name) ||
    /hair\s*colou?r|hair\s*dye/i.test(product.subcategory || '') ||
    product.ingredients.some(i => /p-phenylenediamine|\bppd\b|resorcinol|toluene-2,5-diamine|aminophenol|lawsonia inermis|indigofera tinctoria/i.test(i.name));

  const isCosmetic = isToothpasteOrOral || isHairColorOrDye ||
    product.category === 'Personal Care' ||
    product.category === 'Haircare' ||
    product.category === 'Skincare' ||
    product.category === 'PERSONAL_CARE' ||
    /cosmetic|toothpaste|dental|shampoo|soap|lotion|cream|serum|sunscreen|cleanser|facewash|bodywash|gel|conditioner|hair/i.test(product.subcategory || '') ||
    /cosmetic|toothpaste|dental|shampoo|soap|lotion|cream|serum|sunscreen|cleanser|facewash|bodywash|gel|conditioner|hair/i.test(product.name) ||
    product.ingredients.some(i => /paraben|dimethicone|niacinamide|sls|sodium lauryl sulfate|ceramide|phenoxyethanol|panthenol|stearate|fragrance|parfum/i.test(i.name));

  // Compute or sanitize assessment for cosmetics & hair dyes to guarantee NO nutritional metrics appear
  const assessment = React.useMemo(() => {
    if (isToothpasteOrOral || isHairColorOrDye || isCosmetic) {
      const hasFoodBreakdown = product.safetyAssessment.breakdown.some(b => /nutri/i.test(b.label));
      if (hasFoodBreakdown || isToothpasteOrOral || isHairColorOrDye) {
        return calculateSafetyScore(
          isToothpasteOrOral ? 'Personal Care' : (product.category || 'Haircare'),
          product.ingredients,
          undefined,
          product.skinSuitability,
          { name: product.name, subcategory: product.subcategory, brand: product.brand, rawIngredients: product.rawIngredientsText }
        );
      }
    }
    return product.safetyAssessment;
  }, [product, isToothpasteOrOral, isHairColorOrDye, isCosmetic]);

  const badge = getScoreBadgeColor(assessment.score);
  const redFlags = product.ingredients.filter(i => i.risk === 'red');
  const amberFlags = product.ingredients.filter(i => i.risk === 'amber');

  // Toxic Chemical Screening Flags for Cosmetics & Oral Care
  const hasParabens = product.ingredients.some(i => /paraben|methylparaben|propylparaben|butylparaben/i.test(i.name));
  const hasSls = product.ingredients.some(i => /sodium lauryl sulfate|\bsls\b|sodium laureth sulfate|\bsles\b/i.test(i.name));
  const hasTriclosan = product.ingredients.some(i => /triclosan|triclocarban/i.test(i.name));
  const hasMicroplastics = product.ingredients.some(i => /polyethylene|microbead|microplastic/i.test(i.name));
  const hasFormaldehyde = product.ingredients.some(i => /dmdm hydantoin|imidazolidinyl urea|diazolidinyl urea|quaternium-15|bronopol/i.test(i.name));
  const hasPhthalates = product.ingredients.some(i => /phthalate|\bdep\b|\bdbp\b|\bbha\b|\bbht\b/i.test(i.name));

  // Specialized Screening Flags for Hair Colors & Hair Dyes (BIS IS:10350 & BIS IS:8481)
  const hasPpd = product.ingredients.some(i => /p-phenylenediamine|\bppd\b|para-phenylenediamine/i.test(i.name));
  const hasAmmonia = product.ingredients.some(i => /ammonium hydroxide|\bammonia\b/i.test(i.name));
  const hasResorcinol = product.ingredients.some(i => /resorcinol/i.test(i.name));
  const hasPeroxide = product.ingredients.some(i => /hydrogen peroxide/i.test(i.name));
  const isBotanicalDye = product.ingredients.some(i => /lawsonia inermis|henna|indigofera tinctoria|indigo/i.test(i.name)) && !hasPpd && !hasResorcinol;
  const hasLeadOrHeavyMetals = product.ingredients.some(i => /lead acetate|metallic salt/i.test(i.name));

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
                      {assessment.score.toFixed(1)}
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
                    {assessment.confidence}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mt-3.5">
                {assessment.explanation}
              </p>

              {/* Breakdown bars */}
              <div className="mt-5 space-y-3">
                <span className="text-xs font-bold text-stone-800 block uppercase tracking-wider">Scoring Breakdown</span>
                {assessment.breakdown.map((item, idx) => (
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

            {/* Harmful Chemical & Toxicological Risk Analysis Screen for Cosmetics & Personal Care */}
            {isCosmetic && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-base">
                      🛡️
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Harmful Chemical & Toxicological Analysis</h3>
                      <p className="text-[11px] text-stone-500">Screened against BIS IS:4707 & BIS IS:6356 Safety Standards</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
                    redFlags.length > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {redFlags.length > 0 ? `${redFlags.length} Toxic Flag(s)` : 'Chemical Clean Verified'}
                  </span>
                </div>

                {/* 6-Point Toxic Chemical Audit Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-3.5">
                  <div className={`p-2.5 rounded-2xl border ${hasTriclosan ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Triclosan Toxins</span>
                    <span className={`font-bold block mt-0.5 ${hasTriclosan ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasTriclosan ? '⚠️ Detected' : '✓ Triclosan-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasTriclosan ? 'Endocrine disruptor' : 'Zero banned antibacterials'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasParabens ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Paraben Preservatives</span>
                    <span className={`font-bold block mt-0.5 ${hasParabens ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasParabens ? '⚠️ Detected' : '✓ Paraben-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasParabens ? 'Hormone disruptor' : 'Safe preservation system'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasSls ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Surfactant Safety</span>
                    <span className={`font-bold block mt-0.5 ${hasSls ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasSls ? '⚠️ Harsh SLS' : '✓ 100% SLS-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasSls ? 'Ulcer/desquamation risk' : 'Mild coconut cleansers'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasFormaldehyde ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Formaldehyde Releasers</span>
                    <span className={`font-bold block mt-0.5 ${hasFormaldehyde ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasFormaldehyde ? '⚠️ Detected' : '✓ Formaldehyde-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasFormaldehyde ? 'Carcinogenic gas release' : 'Zero donor toxins'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasPhthalates ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Phthalates & BHT</span>
                    <span className={`font-bold block mt-0.5 ${hasPhthalates ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasPhthalates ? '⚠️ Detected' : '✓ Phthalate-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasPhthalates ? 'Endocrine disruptor' : 'Clean stabilizer matrix'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasMicroplastics ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Microplastics</span>
                    <span className={`font-bold block mt-0.5 ${hasMicroplastics ? 'text-rose-700' : 'text-emerald-800'}`}>
                      {hasMicroplastics ? '⚠️ Detected' : '✓ Microplastic-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasMicroplastics ? 'Periodontal entrapment' : 'Tissue & enamel safe'}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 text-[11px] text-stone-700 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Chemical Toxicology Mandate:</span> SafeScan screens personal care formulas against the Indian Drugs & Cosmetics Act and BIS IS:4707 standards. Non-ingestible cosmetics are evaluated for endocrine disruption, mucosal tissue compatibility, and dermal absorption rather than food nutritional calories.
                  </p>
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

            {/* Hair Color & Hair Dye Formulation Safety Profile (Specialized for Hair Colors & Dyes) */}
            {isHairColorOrDye && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-800 font-bold text-base">
                      🎨
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">Hair Color & Dye Formulation Safety Profile</h3>
                      <p className="text-[11px] text-stone-500">Screened under BIS IS:10350 (Oxidation Dyes) & BIS IS:8481 (Henna/Indigo)</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
                    isBotanicalDye
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : hasPpd
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-purple-100 text-purple-800 border-purple-200'
                  }`}>
                    {isBotanicalDye ? '100% Botanical Dye' : hasPpd ? 'Oxidation Dye (Contains PPD)' : 'Non-Oxidative Color'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-3.5">
                  <div className={`p-2.5 rounded-2xl border ${hasPpd ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">PPD Allergen Status</span>
                    <span className={`font-bold block mt-0.5 ${hasPpd ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {hasPpd ? '⚠️ Contains PPD (<1.5%)' : '✓ 100% PPD-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasPpd ? 'Mandatory 48h patch test' : 'Zero synthetic aromatic amine'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasAmmonia ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Ammonia Status</span>
                    <span className={`font-bold block mt-0.5 ${hasAmmonia ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {hasAmmonia ? '⚠️ Ammonia Present' : '✓ Ammonia-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasAmmonia ? 'Cuticle swelling alkalizer' : 'Mild ethanolamine or pure plant base'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${hasResorcinol ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Resorcinol Coupler</span>
                    <span className={`font-bold block mt-0.5 ${hasResorcinol ? 'text-amber-800' : 'text-emerald-800'}`}>
                      {hasResorcinol ? '⚠️ Resorcinol Detected' : '✓ Resorcinol-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasResorcinol ? 'BIS IS:4707 regulated coupler' : 'Zero endocrine coupler risk'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Oxidative Developer</span>
                    <span className="font-bold text-stone-800 block mt-0.5">
                      {hasPeroxide ? 'Hydrogen Peroxide (6-9%)' : '✓ Developer-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasPeroxide ? 'Melanin bleaching & dye lift' : 'Water-activated botanical pigment'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Heavy Metals & Lead</span>
                    <span className="font-bold text-emerald-800 block mt-0.5">
                      {hasLeadOrHeavyMetals ? '⚠️ Heavy Metals Present' : '✓ 100% Lead-Free'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {hasLeadOrHeavyMetals ? 'Prohibited cosmetic adulterant' : 'Meets BIS heavy metal limits'}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    <span className="text-[10px] font-semibold text-stone-500 block uppercase">Botanical Purity</span>
                    <span className="font-bold text-purple-900 block mt-0.5">
                      {isBotanicalDye ? '✓ Pure Organic Henna/Indigo' : 'Synthetic Permanent Crème'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {isBotanicalDye ? 'Ayurvedic keratin binding' : 'Long-lasting grey coverage'}
                    </span>
                  </div>
                </div>

                {hasPpd && (
                  <div className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-3 text-[11px] text-rose-950 flex items-start gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Mandatory BIS IS:10350 Safety Warning (48-Hour Patch Test):</span>
                      <p className="mt-0.5 text-rose-900">
                        This oxidation hair dye contains <strong>p-Phenylenediamine (PPD)</strong>, which can trigger severe allergic contact dermatitis, itching, and facial swelling in sensitized users. Indian cosmetic regulations mandate a preliminary 48-hour skin allergy test behind the ear or on the inner elbow prior to each use.
                      </p>
                    </div>
                  </div>
                )}

                {isBotanicalDye && (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 text-[11px] text-emerald-950 flex items-start gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">BIS IS:8481 Certified Botanical Formulation:</span>
                      <p className="mt-0.5 text-emerald-900">
                        Pure organic henna and indigo formulation free from synthetic PPD adulteration ('black henna'), metallic salts, and ammonia. Deposits natural lawsone tannins on hair cuticles without structural lipid depletion.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3 text-[11px] text-stone-700 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-stone-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold">Cosmetic Hair Dye Evaluation:</span> Hair colors and dyes are non-ingestible cosmetics regulated under the Indian Drugs & Cosmetics Rules. They carry zero nutritional calories; SafeScan evaluates them on dermal sensitization, scalp barrier tolerance, and aromatic amine safety.
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
