import React from 'react';
import type { Product } from '../types';
import { formatInr, getScoreBadgeColor } from '../utils/formatters';
import { ShieldCheck, ArrowRight, Bookmark } from 'lucide-react';
import { getProductIllustration } from '../utils/productIllustration';

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
      className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-xs hover:shadow-md border border-stone-200/80 transition-all cursor-pointer flex flex-col justify-between group relative"
    >
      {/* Top badges: Score & Save */}
      <div className="relative w-full aspect-square bg-white rounded-xl sm:rounded-2xl overflow-hidden mb-2 p-2 flex items-center justify-center border border-stone-100 shadow-inner">
        <img 
          src={product.thumbnailUrl} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = getProductIllustration(product);
          }}
        />

        {/* Safety Score floating badge */}
        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold backdrop-blur-md flex items-center gap-1 shadow-xs ${badge.bg} border ${badge.border}`}>
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{product.safetyAssessment.score.toFixed(1)}</span>
        </div>

        {/* Save button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(product);
            }}
            className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors ${
              isSaved ? 'bg-[#173D35] text-white' : 'bg-white/90 text-stone-600 hover:bg-white'
            }`}
            title="Save product"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand Name Badge */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 tracking-wider uppercase border border-stone-200/80 truncate">
              {product.brand}
            </span>
          </div>
          {/* Product Name */}
          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 leading-tight" title={product.name}>
            {product.name}
          </h4>
          <p className="text-[10px] sm:text-xs text-stone-500 mt-1 font-medium">{product.packageSize}</p>
        </div>

        {/* Price and Details link */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-500 block leading-none mb-0.5">Price</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#173D35]">
              {formatInr(product.priceInr)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(product);
                }}
                className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  isComparing 
                    ? 'bg-[#173D35] text-white' 
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#173D35]/10 text-[#173D35] hover:bg-[#173D35] hover:text-white transition-colors flex items-center justify-center ml-0.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
