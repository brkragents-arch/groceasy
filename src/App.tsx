import { useState, useEffect } from 'react';
import type { CategoryType, Product, UserPreferences } from './types';
import { ProductService } from './services/productService';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ManualAnalyzerModal } from './components/ManualAnalyzerModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { formatInr } from './utils/formatters';
import { 
  Search, 
  ScanLine, 
  Sparkles, 
  Home, 
  Grid, 
  Bookmark, 
  ShieldCheck, 
  Apple, 
  Package, 
  Wheat, 
  Sparkle, 
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Info,
  Cookie,
  Droplets,
  Coffee,
  ShoppingBag,
  Monitor,
  Smartphone,
  X
} from 'lucide-react';

type MainSector = 'All' | 'FOOD' | 'GROCERY' | 'PERSONAL_CARE';

interface MainSectorConfig {
  key: MainSector;
  label: string;
  icon: any;
  color: string;
  badge: string;
  description: string;
}

const MAIN_SECTORS: MainSectorConfig[] = [
  { 
    key: 'All', 
    label: 'ALL DEPARTMENTS', 
    icon: Grid, 
    color: 'emerald', 
    badge: '180+ Items',
    description: 'All food, grocery & clean personal care'
  },
  { 
    key: 'FOOD', 
    label: 'FOOD', 
    icon: Cookie, 
    color: 'amber', 
    badge: 'Top 20 Ranked',
    description: 'Snacks, Breakfast Oats, Juices & Fresh Produce'
  },
  { 
    key: 'GROCERY', 
    label: 'GROCERY', 
    icon: ShoppingBag, 
    color: 'blue', 
    badge: 'Pure & Unadulterated',
    description: 'Cold-Pressed Oils, A2 Ghee, Millets & Staples'
  },
  { 
    key: 'PERSONAL_CARE', 
    label: 'PERSONAL_CARE', 
    icon: ShieldCheck, 
    color: 'rose', 
    badge: 'Clean Cosmetics',
    description: 'Sulfate-Free Shampoos, Soaps & Sunscreens'
  }
];

const SECTOR_SUBCATEGORIES: Record<MainSector, { label: CategoryType; displayName: string; icon: any }[]> = {
  All: [
    { label: 'Snacks & Munchies', displayName: '🍿 Snacks', icon: Cookie },
    { label: 'Breakfast & Cereals', displayName: '🥣 Breakfast & Oats', icon: Package },
    { label: 'Cooking Oils & Ghee', displayName: '🫒 Oils & Ghee', icon: Droplets },
    { label: 'Beverages & Juices', displayName: '🍵 Juices & Tea', icon: Coffee },
    { label: 'Staples & Millets', displayName: '🌾 Staples & Millets', icon: Wheat },
    { label: 'Haircare', displayName: '🧴 Shampoos', icon: Sparkles },
    { label: 'Personal Care', displayName: '🧼 Soaps', icon: ShieldCheck },
    { label: 'Skincare', displayName: '✨ Skincare & Sunscreens', icon: Sparkle },
    { label: 'Fruits & Vegetables', displayName: '🍎 Fresh Produce', icon: Apple }
  ],
  FOOD: [
    { label: 'FOOD', displayName: 'All in FOOD (Top 20)', icon: Cookie },
    { label: 'Snacks & Munchies', displayName: '🍿 Snacks & Munchies', icon: Cookie },
    { label: 'Breakfast & Cereals', displayName: '🥣 Breakfast & Cereals', icon: Package },
    { label: 'Beverages & Juices', displayName: '🍵 Beverages & Juices', icon: Coffee },
    { label: 'Fruits & Vegetables', displayName: '🍎 Fruits & Vegetables', icon: Apple }
  ],
  GROCERY: [
    { label: 'GROCERY', displayName: 'All in GROCERY (Top 20)', icon: ShoppingBag },
    { label: 'Cooking Oils & Ghee', displayName: '🫒 Cooking Oils & Ghee', icon: Droplets },
    { label: 'Staples & Millets', displayName: '🌾 Staples & Millets', icon: Wheat },
    { label: 'Fruits & Vegetables', displayName: '🍎 Fresh Produce', icon: Apple }
  ],
  PERSONAL_CARE: [
    { label: 'PERSONAL_CARE', displayName: 'All in PERSONAL_CARE (Top 20)', icon: ShieldCheck },
    { label: 'Haircare', displayName: '🧴 Shampoos (Top 20)', icon: Sparkles },
    { label: 'Personal Care', displayName: '🧼 Soaps (Top 20)', icon: ShieldCheck },
    { label: 'Skincare', displayName: '✨ Moisturizers & Sunscreens', icon: Sparkle }
  ]
};

export const App: React.FC = () => {
  // Desktop vs Mobile Viewport Switcher State
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Navigation & view states
  const [activeTab, setActiveTab] = useState<'home' | 'ranking' | 'saved'>('home');
  const [selectedSector, setSelectedSector] = useState<MainSector>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualAnalyzerOpen, setIsManualAnalyzerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [top20Products, setTop20Products] = useState<Product[]>([]);
  const [foodRowProducts, setFoodRowProducts] = useState<Product[]>([]);
  const [groceryRowProducts, setGroceryRowProducts] = useState<Product[]>([]);
  const [personalCareRowProducts, setPersonalCareRowProducts] = useState<Product[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Preferences & Filters
  const [preferences, _setPreferences] = useState<UserPreferences>({
    fragranceFreePreference: false
  });
  const [sortOption, setSortOption] = useState<'score' | 'price-asc' | 'price-desc'>('score');

  const productService = ProductService.getInstance();

  const loadData = async () => {
    setLoading(true);
    let results = await productService.search(searchQuery, selectedCategory, preferences);

    // Apply sorting
    if (sortOption === 'score') {
      results = results.sort((a, b) => b.safetyAssessment.score - a.safetyAssessment.score);
    } else if (sortOption === 'price-asc') {
      results = results.sort((a, b) => (a.priceInr ?? 999999) - (b.priceInr ?? 999999));
    } else if (sortOption === 'price-desc') {
      results = results.sort((a, b) => (b.priceInr ?? 0) - (a.priceInr ?? 0));
    }

    setProducts(results);

    // Load Top 20 for current query & category ranked by quality
    const top20 = await productService.getTop20(selectedCategory, preferences, searchQuery);
    setTop20Products(top20);

    // Load Department Showcase rows when browsing without a query
    if (!searchQuery) {
      const [foodRow, groceryRow, pcRow] = await Promise.all([
        productService.getTop20('FOOD', preferences),
        productService.getTop20('GROCERY', preferences),
        productService.getTop20('PERSONAL_CARE', preferences)
      ]);
      setFoodRowProducts(foodRow.slice(0, 10));
      setGroceryRowProducts(groceryRow.slice(0, 10));
      setPersonalCareRowProducts(pcRow.slice(0, 10));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery, preferences, sortOption]);

  const handleToggleSave = (product: Product) => {
    setSavedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleToggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products simultaneously.');
        return prev;
      }
      return [...prev, product];
    });
  };

  // If a product detail is open, render detailed view
  if (selectedProduct) {
    const detailView = (
      <ProductDetail 
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        isSaved={savedProducts.some(p => p.id === selectedProduct.id)}
        onToggleSave={handleToggleSave}
        onCompare={handleToggleCompare}
        isComparing={compareProducts.some(p => p.id === selectedProduct.id)}
      />
    );

    if (viewMode === 'mobile') {
      return (
        <div className="min-h-screen bg-stone-900 py-6 px-3 flex flex-col items-center justify-start">
          <div className="w-full max-w-[430px] mb-3 flex items-center justify-between text-xs text-stone-300 px-2">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Preview Mode</span>
            </span>
            <button
              onClick={() => setViewMode('desktop')}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors flex items-center gap-1"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Switch to Desktop View</span>
            </button>
          </div>
          <div className="mobile-device-chassis shadow-2xl overflow-y-auto max-h-[90vh] w-full max-w-[420px] bg-[#F8F9F7] custom-scrollbar relative">
            <div className="mobile-dynamic-island" />
            {detailView}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F9F7]">
        {/* Desktop top bar to switch view or navigate */}
        <div className="bg-[#112d27] text-white px-4 sm:px-8 py-2 text-xs flex items-center justify-between border-b border-emerald-900/40">
          <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Groceasy India • Formulation & Safety Analysis Report
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('mobile')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors font-medium"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview in Mobile View</span>
            </button>
          </div>
        </div>
        {detailView}
      </div>
    );
  }

  // Common inner content rendered in both Desktop and Mobile views
  const renderSectorSelector = () => (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200/80 space-y-4">
      {/* Row 1: Primary Department / Sector Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {MAIN_SECTORS.map((sector) => {
          const Icon = sector.icon;
          const isSelected = selectedSector === sector.key;
          return (
            <button
              key={sector.key}
              onClick={() => {
                setSelectedSector(sector.key);
                setSelectedCategory(sector.key);
                setSearchQuery('');
              }}
              className={`flex flex-col text-left p-3 sm:p-4 rounded-2xl transition-all border relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#173D35] text-white border-[#173D35] shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-white/15 text-emerald-300' : 'bg-white text-stone-700 shadow-xs'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-400/20 text-emerald-300' : 'bg-stone-200/70 text-stone-600'
                }`}>
                  {sector.badge}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                {sector.label}
              </span>
              <span className={`text-[11px] mt-0.5 line-clamp-1 ${
                isSelected ? 'text-emerald-100/70' : 'text-stone-500'
              }`}>
                {sector.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 2: Subcategories contextual to selected sector */}
      <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        <span className="text-xs font-bold text-stone-500 flex-shrink-0 uppercase tracking-wider text-[10px]">
          Categories:
        </span>
        {SECTOR_SUBCATEGORIES[selectedSector].map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.label;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-amber-400 text-stone-900 shadow-xs scale-[1.02]'
                  : 'bg-stone-100/80 text-stone-700 hover:bg-stone-200/70 border border-stone-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-900' : 'text-stone-600'}`} />
              <span>{cat.displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderProductGrid = () => (
    <>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-stone-200 rounded-3xl h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 text-xs shadow-sm border border-stone-100 space-y-2">
          <AlertCircle className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-800">No matching products found</p>
          <p className="text-xs text-stone-500">Try searching for other food, grocery, or personal care items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
              isSaved={savedProducts.some(p => p.id === product.id)}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              isComparing={compareProducts.some(p => p.id === product.id)}
            />
          ))}
        </div>
      )}
    </>
  );

  const renderShowcaseRow = (title: string, subtitle: string, iconStr: string, sectorKey: MainSector, items: Product[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              {iconStr}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900">{title}</h3>
              <p className="text-xs text-stone-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedSector(sectorKey);
              setSelectedCategory(sectorKey);
            }}
            className="text-xs font-bold text-[#173D35] hover:text-emerald-700 hover:underline flex items-center gap-1 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-xl transition-colors border border-stone-200/60"
          >
            <span>View All {sectorKey}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto custom-scrollbar pb-2 pt-1">
          {items.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="flex-shrink-0 w-44 sm:w-52 md:w-56 bg-stone-50/70 hover:bg-white rounded-2xl p-3 shadow-xs hover:shadow-md border border-stone-200/70 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-2.5">
                <img 
                  src={p.thumbnailUrl} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  loading="lazy" 
                />
                <span className="absolute top-2 left-2 bg-[#173D35] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  ★ {p.safetyAssessment.score.toFixed(1)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white text-stone-800 uppercase tracking-wider border border-stone-200/80 truncate">
                    {p.brand}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug mb-1" title={p.name}>
                  {p.name}
                </h4>
              </div>
              <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-xs font-black text-[#173D35]">{formatInr(p.priceInr)}</span>
                <span className="text-[10px] font-medium text-stone-500">{p.packageSize}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTop20Ranking = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-3xl border border-stone-200/80">
        <div>
          <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#173D35]" />
            <span>
              {searchQuery ? `Top 20 "${searchQuery}" Ranked by Safety` : `Top 20 Clean Choices (${selectedCategory})`}
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Formulation safety assessed against ICMR-NIN guidelines, FSSAI regulations & BIS standards
          </p>
        </div>
        <span className="text-xs bg-emerald-100 text-[#173D35] px-3 py-1 rounded-full font-bold self-start sm:self-auto">
          {top20Products.length} Verified Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {top20Products.map((product, rankIdx) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-3xl p-4 shadow-xs border border-stone-200/80 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
          >
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
              rankIdx === 0 
                ? 'bg-amber-400 text-stone-900 shadow-xs' 
                : rankIdx < 3 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#173D35] text-white'
            }`}>
              #{rankIdx + 1}
            </div>
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-2xl flex-shrink-0 bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 uppercase tracking-wider border border-stone-200/80">
                  {product.brand}
                </span>
                <span className="text-[10px] text-stone-400">•</span>
                <span className="text-[10px] text-stone-500 font-medium truncate">{product.category}</span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug" title={product.name}>
                {product.name}
              </h4>
              <p className="text-[11px] text-stone-500 mt-1 font-semibold">{product.packageSize} • {formatInr(product.priceInr)}</p>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <span className="text-base font-black text-[#173D35]">
                {product.safetyAssessment.score.toFixed(1)}
              </span>
              <span className="text-[10px] text-stone-400 block font-semibold">/ 10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSavedTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-stone-200/80">
        <div>
          <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#173D35]" />
            <span>Saved Clean Products ({savedProducts.length})</span>
          </h2>
          <p className="text-xs text-stone-500">Bookmarked items stored for quick comparison and purchase</p>
        </div>
      </div>
      {savedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-500 text-xs shadow-sm border border-stone-100 space-y-3">
          <Bookmark className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-800">No products saved yet</p>
          <p className="text-xs text-stone-500">Bookmark products while browsing to keep track of your favorites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {savedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
              isSaved={true}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              isComparing={compareProducts.some(p => p.id === product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Quick chips for top queries
  const quickChips = [
    { label: '🥗 FOOD', query: 'food', cat: 'FOOD' as CategoryType, sector: 'FOOD' as MainSector },
    { label: '🛒 GROCERY', query: 'grocery', cat: 'GROCERY' as CategoryType, sector: 'GROCERY' as MainSector },
    { label: '🧴 PERSONAL_CARE', query: 'personal_care', cat: 'PERSONAL_CARE' as CategoryType, sector: 'PERSONAL_CARE' as MainSector },
    { label: '🍿 Snacks', query: 'snacks', cat: 'Snacks & Munchies' as CategoryType, sector: 'FOOD' as MainSector },
    { label: '🥣 Breakfast & Oats', query: 'oats', cat: 'Breakfast & Cereals' as CategoryType, sector: 'FOOD' as MainSector },
    { label: '🫒 Oils & Ghee', query: 'cooking oils', cat: 'Cooking Oils & Ghee' as CategoryType, sector: 'GROCERY' as MainSector },
    { label: '🍵 Juices & Tea', query: 'beverages', cat: 'Beverages & Juices' as CategoryType, sector: 'FOOD' as MainSector },
    { label: '🌾 Staples & Millets', query: 'staples', cat: 'Staples & Millets' as CategoryType, sector: 'GROCERY' as MainSector },
    { label: '🧴 Shampoos', query: 'shampoos', cat: 'Haircare' as CategoryType, sector: 'PERSONAL_CARE' as MainSector },
    { label: '🧼 Soaps', query: 'soaps', cat: 'Personal Care' as CategoryType, sector: 'PERSONAL_CARE' as MainSector },
    { label: '✨ Moisturizers', query: 'moisturizers', cat: 'Skincare' as CategoryType, sector: 'PERSONAL_CARE' as MainSector },
    { label: '☀️ Sunscreens', query: 'sunscreens', cat: 'Skincare' as CategoryType, sector: 'PERSONAL_CARE' as MainSector }
  ];

  // Mobile Device Simulator Layout
  if (viewMode === 'mobile') {
    return (
      <div className="min-h-screen bg-stone-900 py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-start selection:bg-emerald-200">
        {/* Device Switcher Control Toolbar */}
        <div className="w-full max-w-[430px] mb-3 flex items-center justify-between text-xs text-stone-300 px-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Preview (iPhone / Android)</span>
          </div>
          <button
            onClick={() => setViewMode('desktop')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Desktop View</span>
          </button>
        </div>

        {/* Realistic Mobile Device Frame */}
        <div className="mobile-device-chassis shadow-2xl relative w-full max-w-[420px] h-[860px] max-h-[92vh] flex flex-col overflow-hidden bg-[#F8F9F7]">
          {/* Dynamic Island Notch */}
          <div className="mobile-dynamic-island" />

          {/* Internal Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
            {/* Mobile Header */}
            <header className="bg-[#173D35] text-white pt-5 pb-7 px-4 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-base font-black tracking-tight flex items-center gap-1">
                      Groceasy <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">India</span>
                    </h1>
                    <p className="text-[10px] text-emerald-100/70">Food, Grocery & Cosmetics Safety</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {compareProducts.length > 0 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      <span>({compareProducts.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsManualAnalyzerOpen(true)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search food, oils, shampoos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-14 py-2.5 bg-white text-stone-900 rounded-2xl text-xs placeholder:text-stone-400 font-medium focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(chip.query);
                      setSelectedCategory(chip.cat);
                      setSelectedSector(chip.sector);
                    }}
                    className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded-lg transition-all font-semibold ${
                      searchQuery.toLowerCase() === chip.query.toLowerCase()
                        ? 'bg-amber-400 text-stone-900 font-bold'
                        : 'bg-white/10 text-emerald-100'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </header>

            {/* Mobile Main Body */}
            <main className="px-3 -mt-3 space-y-4">
              {renderSectorSelector()}

              {activeTab === 'saved' ? (
                renderSavedTab()
              ) : activeTab === 'ranking' ? (
                renderTop20Ranking()
              ) : (
                <div className="space-y-4">
                  {/* Sort selection */}
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
                    <span>{products.length} Products Found</span>
                    <select
                      value={sortOption}
                      onChange={e => setSortOption(e.target.value as any)}
                      className="bg-white text-stone-700 text-xs px-2 py-1 rounded-xl border border-stone-200 outline-none"
                    >
                      <option value="score">Highest Safety Score</option>
                      <option value="price-asc">Price Low to High</option>
                      <option value="price-desc">Price High to Low</option>
                    </select>
                  </div>

                  {!searchQuery && selectedCategory === 'All' && (
                    <div className="space-y-4">
                      {renderShowcaseRow('🥗 FOOD (Top Quality)', 'ICMR-NIN Checked', '🥗', 'FOOD', foodRowProducts)}
                      {renderShowcaseRow('🛒 GROCERY (Pure)', 'Oils & Ghee', '🛒', 'GROCERY', groceryRowProducts)}
                      {renderShowcaseRow('🧴 PERSONAL_CARE', 'Clean Cosmetics', '🧴', 'PERSONAL_CARE', personalCareRowProducts)}
                    </div>
                  )}

                  {renderProductGrid()}
                </div>
              )}
            </main>
          </div>

          {/* Mobile Bottom Navigation Bar (Docked to Chassis) */}
          <nav className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                activeTab === 'home' ? 'text-[#173D35]' : 'text-stone-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                activeTab === 'ranking' ? 'text-[#173D35]' : 'text-stone-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Top 20</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-10 h-10 -mt-4 rounded-full bg-[#173D35] text-white flex items-center justify-center shadow-lg border-2 border-white"
            >
              <ScanLine className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
                activeTab === 'saved' ? 'text-[#173D35]' : 'text-stone-400'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </button>
            <button
              onClick={() => setIsManualAnalyzerOpen(true)}
              className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-stone-400"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </nav>
        </div>

        {/* Modals inside mobile view */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onProductFound={setSelectedProduct}
          onManualAnalyze={() => setIsManualAnalyzerOpen(true)}
        />
        <ManualAnalyzerModal
          isOpen={isManualAnalyzerOpen}
          onClose={() => setIsManualAnalyzerOpen(false)}
          onProductCreated={setSelectedProduct}
        />
        <ProductComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          products={compareProducts}
          onRemoveProduct={id => setCompareProducts(prev => prev.filter(p => p.id !== id))}
          onSelectProduct={prod => {
            setIsCompareModalOpen(false);
            setSelectedProduct(prod);
          }}
        />
      </div>
    );
  }

  // Full Desktop View (Spans entire browser edge-to-edge)
  return (
    <div className="min-h-screen bg-[#F8F9F7] text-stone-900 pb-20 selection:bg-emerald-200">
      {/* Top Groceasy Forest-Green Banner & Header */}
      <header className="bg-[#173D35] text-white pt-5 pb-8 px-4 sm:px-6 lg:px-8 shadow-md relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -top-10 w-80 h-80 bg-[#23584d]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl 2xl:max-w-[1600px] w-full mx-auto relative z-10 space-y-5">
          {/* Top Brand Bar & Global Desktop Navigation */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  Groceasy <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">India</span>
                </h1>
                <p className="text-xs text-emerald-100/70 font-medium">Clean Food, Pure Grocery & Non-Toxic Cosmetics</p>
              </div>
            </div>

            {/* Desktop Center Navigation Pills */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'home'
                    ? 'bg-emerald-400 text-[#173D35] shadow-xs'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home Catalog</span>
              </button>
              <button
                onClick={() => setActiveTab('ranking')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ranking'
                    ? 'bg-emerald-400 text-[#173D35] shadow-xs'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Top 20 Safer Rankings</span>
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-emerald-400 text-[#173D35] shadow-xs'
                    : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved Items ({savedProducts.length})</span>
              </button>
            </div>

            {/* Right Tools & Viewport Mode Switcher */}
            <div className="flex items-center gap-3">
              {/* Compare Button */}
              {compareProducts.length > 0 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Compare ({compareProducts.length})</span>
                </button>
              )}

              {/* Quick Analyzer Button */}
              <button
                onClick={() => setIsManualAnalyzerOpen(true)}
                title="Paste custom ingredients to analyze"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Ingredient Analyzer</span>
              </button>

              {/* View Switcher Toggle Pill */}
              <div className="flex items-center bg-black/25 backdrop-blur-md p-1 rounded-2xl border border-white/15">
                <button
                  onClick={() => setViewMode('desktop')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-emerald-400 text-[#173D35] shadow-xs"
                  title="Full-width desktop view"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-emerald-200/80 hover:text-white"
                  title="Switch to Mobile Device simulator"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Amazon India Integrated Full-Width Search Bar */}
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search any food, grocery, or personal care item (e.g. snacks, oats, oils, shampoos, moisturizers)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-24 py-3.5 bg-white text-stone-900 rounded-2xl text-sm placeholder:text-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
                />
                <div className="absolute right-3.5 top-2.5 flex items-center gap-2">
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-stone-400 hover:text-stone-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-[11px] font-bold bg-[#FF9900]/15 text-[#b87000] px-2.5 py-1 rounded-lg border border-[#FF9900]/30 hidden sm:inline-block">
                    amazon.in
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-[#173D35] px-5 rounded-2xl flex items-center justify-center font-bold text-sm gap-2 transition-colors shadow-md flex-shrink-0"
              >
                <ScanLine className="w-5 h-5" />
                <span className="hidden sm:inline">Scan Barcode</span>
              </button>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1">
              <span className="text-xs font-bold text-emerald-200/90 uppercase tracking-wider flex-shrink-0">
                Quick Top 20:
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(chip.query);
                    setSelectedCategory(chip.cat);
                    setSelectedSector(chip.sector);
                  }}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl transition-all font-semibold ${
                    searchQuery.toLowerCase() === chip.query.toLowerCase()
                      ? 'bg-amber-400 text-stone-900 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Spans Entire Desktop Width) */}
      <main className="max-w-7xl 2xl:max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-6">
        {/* Department / Category Selector */}
        {renderSectorSelector()}

        {/* Tab View Switching */}
        {activeTab === 'saved' ? (
          renderSavedTab()
        ) : activeTab === 'ranking' ? (
          renderTop20Ranking()
        ) : (
          /* Home Tab View */
          <div className="space-y-6">
            {/* Filter and Count Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-extrabold text-stone-900">
                  {selectedCategory === 'All' ? 'All Verified Indian Products' : selectedCategory}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#173D35] border border-emerald-200/70">
                  {products.length} Products
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 font-semibold hidden sm:inline">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="bg-stone-50 text-stone-700 text-xs sm:text-sm px-3 py-2 rounded-xl border border-stone-200 outline-none font-bold cursor-pointer hover:bg-stone-100"
                >
                  <option value="score">Highest Safety Score (Cleanest First)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Department Showcase Product Rows (FOOD, GROCERY, PERSONAL_CARE) */}
            {!searchQuery && selectedCategory === 'All' && (
              <div className="space-y-6">
                {renderShowcaseRow(
                  '🥗 FOOD (Top Quality Choices)', 
                  'Packaged Snacks, Breakfast Oats & Beverages evaluated for refined sugar, palm oil & preservatives', 
                  '🥗', 
                  'FOOD', 
                  foodRowProducts
                )}
                {renderShowcaseRow(
                  '🛒 GROCERY (Pure & Unadulterated Staples)', 
                  'Cold-Pressed Oils, Cultured A2 Ghee, Unpolished Dals & Organic Millets', 
                  '🛒', 
                  'GROCERY', 
                  groceryRowProducts
                )}
                {renderShowcaseRow(
                  '🧴 PERSONAL_CARE (Clean Beauty & Bodycare)', 
                  'Sulfate-Free Shampoos, Mineral Sunscreens & Gentle Grade-1 Soaps', 
                  '🧴', 
                  'PERSONAL_CARE', 
                  personalCareRowProducts
                )}
              </div>
            )}

            {/* Top 20 Quality Choices Spotlight Preview Card */}
            {top20Products.length > 0 && (
              <div className="bg-emerald-950 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md">
                      #1 Safest Pick
                    </span>
                    <span className="text-xs text-emerald-200/80">
                      {searchQuery ? `in "${searchQuery}"` : `in ${selectedCategory}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">{top20Products[0].name}</h3>
                  <p className="text-xs text-emerald-200/70">
                    {top20Products[0].brand} • {top20Products[0].packageSize} • {formatInr(top20Products[0].priceInr)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedProduct(top20Products[0])}
                    className="bg-emerald-400 hover:bg-emerald-300 text-[#173D35] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    Inspect Full Assessment
                  </button>
                  <button
                    onClick={() => setActiveTab('ranking')}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors border border-white/10 flex items-center gap-1"
                  >
                    <span>View All Top 20</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {renderProductGrid()}

            {/* Transparent Scoring Engine Standards Banner */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#173D35] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-1">
                <p className="font-extrabold text-stone-900 text-sm sm:text-base">Scientific & Regulatory Safety Engine</p>
                <p>
                  Groceasy analyzes ingredients against ICMR-NIN nutritional standards, FSSAI additive schedules, and Bureau of Indian Standards (BIS IS:4707). Red alerts identify substantiated hazards (carcinogenic impurities, endocrine disruptors, trans fats, harsh surfactants); amber alerts identify allergens, high added sugars, or synthetic perfumes.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Compare Action Bar if items selected */}
      {compareProducts.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-6 right-6 z-30 animate-bounce-short">
          <div className="bg-[#173D35] text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{compareProducts.length} Selected to Compare</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareProducts([])}
                className="text-xs text-stone-300 hover:text-white px-2 py-1 font-semibold"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-emerald-400 text-[#173D35] px-4 py-2 rounded-xl font-extrabold text-xs hover:bg-emerald-300 transition-colors shadow-sm"
              >
                Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Only Bottom Navigation (on physical mobile viewports when in desktop mode) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-6 py-2.5 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'home' ? 'text-[#173D35]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'ranking' ? 'text-[#173D35]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Top 20</span>
          </button>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-12 h-12 -mt-5 rounded-full bg-[#173D35] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform border-4 border-[#F8F9F7]"
            title="Scan Barcode"
          >
            <ScanLine className="w-6 h-6 text-emerald-400" />
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              activeTab === 'saved' ? 'text-[#173D35]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span>Saved ({savedProducts.length})</span>
          </button>
          <button
            onClick={() => setIsManualAnalyzerOpen(true)}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              isManualAnalyzerOpen ? 'text-[#173D35]' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze</span>
          </button>
        </div>
      </nav>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={setSelectedProduct}
        onManualAnalyze={() => setIsManualAnalyzerOpen(true)}
      />

      {/* Custom Ingredients Manual Analyzer Modal */}
      <ManualAnalyzerModal
        isOpen={isManualAnalyzerOpen}
        onClose={() => setIsManualAnalyzerOpen(false)}
        onProductCreated={setSelectedProduct}
      />

      {/* Side-by-Side Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareProducts}
        onRemoveProduct={id => setCompareProducts(prev => prev.filter(p => p.id !== id))}
        onSelectProduct={prod => {
          setIsCompareModalOpen(false);
          setSelectedProduct(prod);
        }}
      />
    </div>
  );
};

export default App;
