import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { ShieldCheck, ArrowRight, Bookmark } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  isSaved?: boolean;
  onToggleSave?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  isSaved = false,
  onToggleSave,
  onToggleCompare,
  isComparing = false
}) => {
  const badge = getScoreBadgeColor(product.safetyAssessment.score);

  return (
    <div 
      onClick={() => onSelect(product)}
      className="bg-white rounded-3xl p-3.5 shadow-sm border border-stone-100/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
    >
      {/* Top badges: Score & Save */}
      <div className="relative w-full aspect-square bg-stone-50 rounded-2xl overflow-hidden mb-3">
        <img 
          src={product.thumbnailUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            import('../utils/productIllustration').then(({ getProductIllustration }) => {
              target.src = getProductIllustration(product.name, product.subcategory, product.brand);
            });
          }}
        />

        {/* Safety Score floating badge */}
        <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1 shadow-sm ${badge.bg} border ${badge.border}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{product.safetyAssessment.score.toFixed(1)}</span>
        </div>

        {/* Save button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(product);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors ${
              isSaved ? 'bg-[#173D35] text-white' : 'bg-white/80 text-stone-600 hover:bg-white'
            }`}
            title="Save product"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand Name Badge */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 tracking-wider uppercase border border-stone-200/80">
              {product.brand}
            </span>
          </div>
          {/* Product Name */}
          <h4 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug" title={product.name}>
            {product.name}
          </h4>
          <p className="text-xs text-stone-500 mt-1 font-medium">{product.packageSize}</p>
        </div>

        {/* Price and Details link */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-600 block leading-tight">Price</span>
            <span className="text-base font-bold text-[#173D35]">
              {formatInr(product.priceInr)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-colors ${
                  isComparing 
                    ? 'bg-[#173D35] text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {isComparing ? 'Added' : 'Compare'}
              </button>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="w-8 h-8 rounded-full bg-[#173D35]/10 text-[#173D35] hover:bg-[#173D35] hover:text-white transition-colors flex items-center justify-center ml-1"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
