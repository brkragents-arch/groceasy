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
  SlidersHorizontal, 
  Home, 
  Grid, 
  Bookmark, 
  User, 
  ShieldCheck, 
  Apple, 
  Package, 
  Milk, 
  Wheat, 
  Sparkle, 
  Layers,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
  Cookie,
  Droplets,
  Coffee,
  ShoppingBag,
  Utensils
} from 'lucide-react';

type MainSector = 'All' | 'FOOD' | 'GROCERY' | 'PERSONAL_CARE';

interface MainSectorConfig {
  key: MainSector;
  label: string;
  icon: any;
  color: string;
  badge: string;
}

const MAIN_SECTORS: MainSectorConfig[] = [
  { key: 'All', label: 'ALL', icon: Grid, color: 'emerald', badge: '180+ Items' },
  { key: 'FOOD', label: 'FOOD', icon: Cookie, color: 'amber', badge: 'Snacks, Cereals, Juices' },
  { key: 'GROCERY', label: 'GROCERY', icon: ShoppingBag, color: 'blue', badge: 'Oils, Ghee, Staples' },
  { key: 'PERSONAL_CARE', label: 'PERSONAL_CARE', icon: ShieldCheck, color: 'rose', badge: 'Hair, Skin & Body' }
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
    { label: 'Skincare', displayName: '✨ Moisturizers & Sunscreens', icon: Sparkle },
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
  // Navigation & view states
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'scan' | 'saved' | 'ranking'>('home');
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
    return (
      <ProductDetail 
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        isSaved={savedProducts.some(p => p.id === selectedProduct.id)}
        onToggleSave={handleToggleSave}
        onCompare={handleToggleCompare}
        isComparing={compareProducts.some(p => p.id === selectedProduct.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7] text-stone-900 pb-28 selection:bg-emerald-200">
      {/* Top Groceasy Forest-Green Banner & Header */}
      <header className="bg-[#173D35] text-white pt-6 pb-8 px-4 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-700/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/4 -top-10 w-36 h-36 bg-[#23584d]/30 rounded-full blur-xl pointer-events-none" />

        <div className="max-w-xl mx-auto relative z-10">
          {/* Logo & Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                  Groceasy <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-400/30">India</span>
                </h1>
                <p className="text-[11px] text-emerald-100/70">Food, Grocery & Cosmetics Safety</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {compareProducts.length > 0 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Compare ({compareProducts.length})</span>
                </button>
              )}

              <button
                onClick={() => setIsManualAnalyzerOpen(true)}
                title="Paste custom ingredients to analyze"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/10 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Amazon India Integrated Search Bar & Scan trigger */}
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Enter category or item (e.g. snacks, oats, oils, beverages, shampoos)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-3 bg-white text-stone-900 rounded-2xl text-xs placeholder:text-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-stone-400 hover:text-stone-600 font-bold px-1"
                    >
                      ✕
                    </button>
                  )}
                  <span className="text-[10px] font-bold bg-[#FF9900]/15 text-[#b87000] px-2 py-0.5 rounded-lg border border-[#FF9900]/30 hidden sm:inline-block">
                    amazon.in
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-[#173D35] px-4 rounded-2xl flex items-center justify-center font-bold text-xs gap-1.5 transition-colors shadow-sm"
              >
                <ScanLine className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>

            {/* Quick Search Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] font-semibold text-emerald-200/80 uppercase tracking-wider flex-shrink-0">
                Quick Top 20:
              </span>
              {[
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
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(chip.query);
                    setSelectedCategory(chip.cat);
                    setSelectedSector(chip.sector);
                  }}
                  className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-xl transition-all font-medium ${
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

          {/* Groceasy Value proposition pill */}
          <div className="mt-3.5 flex items-center justify-between text-[11px] text-emerald-100/80 px-1">
            <span className="flex items-center gap-1">
              <span>🛒 Amazon India Product Catalog</span>
            </span>
            <span className="font-semibold text-emerald-300">Top 20 Ranked by Quality & Safety</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 -mt-3">
        {/* Category Rows Selector */}
        <div className="bg-white rounded-3xl p-3 shadow-sm border border-stone-100 space-y-2.5">
          {/* Row 1: Primary Department / Sector Rows */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
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
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-[#173D35] text-white border-[#173D35] shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-400' : 'text-stone-600'}`} />
                  <span className="text-[11px] font-bold tracking-tight truncate w-full text-center">
                    {sector.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Subcategories contextual to the selected sector */}
          <div className="pt-1.5 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SECTOR_SUBCATEGORIES[selectedSector].map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-900' : 'text-stone-500'}`} />
                  <span>{cat.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Switching Logic */}
        {activeTab === 'saved' ? (
          /* Saved Products Screen */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">Saved Safe Products ({savedProducts.length})</h2>
            </div>
            {savedProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-stone-500 text-xs shadow-sm border border-stone-100 space-y-2">
                <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-semibold text-stone-700">No products saved yet</p>
                <p>Bookmark products while browsing to compare safety rankings later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
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
        ) : activeTab === 'ranking' ? (
          /* Top 20 Screen */
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#173D35]" />
                  <span>
                    {searchQuery ? `Top 20 "${searchQuery}" by Quality` : `Top 20 Safer Choices (${selectedCategory})`}
                  </span>
                </h2>
                <p className="text-xs text-stone-500">Ranked by ingredient safety & formulation quality (highest to lowest)</p>
              </div>
              <span className="text-xs bg-emerald-100 text-[#173D35] px-2.5 py-0.5 rounded-full font-bold">
                {top20Products.length} Ranked
              </span>
            </div>

            <div className="space-y-3">
              {top20Products.map((product, rankIdx) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-3xl p-3.5 shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#173D35] text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                    #{rankIdx + 1}
                  </div>
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-2xl flex-shrink-0 bg-stone-50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-[#173D35] uppercase tracking-wider border border-emerald-200/80">
                        {product.brand}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug" title={product.name}>
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5 font-medium">{product.packageSize} • {formatInr(product.priceInr)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#173D35]">
                      {product.safetyAssessment.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-stone-400 block">/ 10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Default Home Screen */
          <div className="mt-6 space-y-6">
            {/* Quick Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-800">
                  {selectedCategory === 'All' ? 'All Verified Products' : selectedCategory} ({products.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as any)}
                  className="bg-white text-stone-700 text-xs px-2.5 py-1.5 rounded-xl border border-stone-200 outline-none font-medium"
                >
                  <option value="score">Sort: Highest Safety Score</option>
                  <option value="price-asc">Sort: Price Low to High</option>
                  <option value="price-desc">Sort: Price High to Low</option>
                </select>
              </div>
            </div>

            {/* Department Showcase Product Rows (FOOD, GROCERY, PERSONAL_CARE) */}
            {!searchQuery && selectedCategory === 'All' && (
              <div className="space-y-6">
                {/* 1. FOOD Showcase Row */}
                {foodRowProducts.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          🥗
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-stone-900">FOOD (Top Quality Choices)</h3>
                          <p className="text-[10px] text-stone-500">Snacks, Cereals & Beverages (ICMR-NIN Checked)</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSector('FOOD');
                          setSelectedCategory('FOOD');
                        }}
                        className="text-[11px] font-bold text-[#173D35] hover:underline flex items-center gap-0.5"
                      >
                        <span>View All FOOD</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {foodRowProducts.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="flex-shrink-0 w-32 bg-white rounded-2xl p-2.5 shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative w-full aspect-square bg-stone-50 rounded-xl overflow-hidden mb-2">
                            <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-[#173D35] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                              ★ {p.safetyAssessment.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 uppercase tracking-wider border border-stone-200/80 truncate">
                              {p.brand}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-bold text-stone-900 line-clamp-2 leading-tight mb-1" title={p.name}>{p.name}</h4>
                          <span className="text-[11px] font-bold text-emerald-800">{formatInr(p.priceInr)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. GROCERY Showcase Row */}
                {groceryRowProducts.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          🛒
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-stone-900">GROCERY (Pure Staples & Oils)</h3>
                          <p className="text-[10px] text-stone-500">Cold Pressed Oils, A2 Ghee, Millets & Dals</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSector('GROCERY');
                          setSelectedCategory('GROCERY');
                        }}
                        className="text-[11px] font-bold text-[#173D35] hover:underline flex items-center gap-0.5"
                      >
                        <span>View All GROCERY</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {groceryRowProducts.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="flex-shrink-0 w-32 bg-white rounded-2xl p-2.5 shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative w-full aspect-square bg-stone-50 rounded-xl overflow-hidden mb-2">
                            <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-[#173D35] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                              ★ {p.safetyAssessment.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 uppercase tracking-wider border border-stone-200/80 truncate">
                              {p.brand}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-bold text-stone-900 line-clamp-2 leading-tight mb-1" title={p.name}>{p.name}</h4>
                          <span className="text-[11px] font-bold text-emerald-800">{formatInr(p.priceInr)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PERSONAL_CARE Showcase Row */}
                {personalCareRowProducts.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                          🧴
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-stone-900">PERSONAL_CARE (Clean Beauty & Care)</h3>
                          <p className="text-[10px] text-stone-500">Safe Shampoos, Soaps & Sunscreens</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSector('PERSONAL_CARE');
                          setSelectedCategory('PERSONAL_CARE');
                        }}
                        className="text-[11px] font-bold text-[#173D35] hover:underline flex items-center gap-0.5"
                      >
                        <span>View All PERSONAL_CARE</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {personalCareRowProducts.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="flex-shrink-0 w-32 bg-white rounded-2xl p-2.5 shadow-sm border border-stone-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="relative w-full aspect-square bg-stone-50 rounded-xl overflow-hidden mb-2">
                            <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-[#173D35] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                              ★ {p.safetyAssessment.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 uppercase tracking-wider border border-stone-200/80 truncate">
                              {p.brand}
                            </span>
                          </div>
                          <h4 className="text-[11px] font-bold text-stone-900 line-clamp-2 leading-tight mb-1" title={p.name}>{p.name}</h4>
                          <span className="text-[11px] font-bold text-emerald-800">{formatInr(p.priceInr)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top 20 Quality Choices Preview Card */}
            {top20Products.length > 0 && (
              <div className="bg-emerald-950 text-white rounded-3xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ★
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      {searchQuery ? `#1 Ranked in "${searchQuery}"` : `#1 Safest in ${selectedCategory}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('ranking')}
                    className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>View Top 20 List</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div 
                  onClick={() => setSelectedProduct(top20Products[0])}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/15 transition-colors"
                >
                  <img
                    src={top20Products[0].thumbnailUrl}
                    alt={top20Products[0].name}
                    className="w-14 h-14 object-cover rounded-xl bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/20 text-emerald-200 uppercase tracking-wider border border-white/20">
                        {top20Products[0].brand}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{top20Products[0].name}</h4>
                    <p className="text-[11px] text-emerald-100/70 mt-0.5 font-medium">{formatInr(top20Products[0].priceInr)} • {top20Products[0].packageSize}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-300">
                      {top20Products[0].safetyAssessment.score.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-emerald-200/70 block">Score</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-stone-200 rounded-3xl h-64" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-stone-500 text-xs shadow-sm border border-stone-100 space-y-2">
                <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-semibold text-stone-700">No matching products found</p>
                <p>Try searching for other food, grocery, or skincare items.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
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

            {/* Informational Banner */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-2xl bg-emerald-50 text-[#173D35] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="text-xs text-stone-600 leading-relaxed">
                <p className="font-bold text-stone-900 mb-0.5">Transparent Scoring Engine</p>
                <p>
                  SafeScan analyzes ingredients against ICMR-NIN guidelines, FSSAI additive schedules, and BIS IS:4707 standards. Red ingredients highlight substantiated hazards; amber highlights sensitizers or excessive added sugars.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Compare Action Bar if items selected */}
      {compareProducts.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-30 max-w-xl mx-auto animate-bounce-short">
          <div className="bg-[#173D35] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{compareProducts.length} Product{compareProducts.length > 1 ? 's' : ''} Ready to Compare</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareProducts([])}
                className="text-[11px] text-stone-300 hover:text-white px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="bg-emerald-400 text-[#173D35] px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-300 transition-colors shadow-sm"
              >
                View Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groceasy Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-6 py-2.5 shadow-lg">
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

          {/* Center Scan FAB */}
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
        onProductFound={(prod) => {
          setSelectedProduct(prod);
        }}
        onManualAnalyze={() => {
          setIsManualAnalyzerOpen(true);
        }}
      />

      {/* Custom Ingredients Manual Analyzer Modal */}
      <ManualAnalyzerModal
        isOpen={isManualAnalyzerOpen}
        onClose={() => setIsManualAnalyzerOpen(false)}
        onProductCreated={(prod) => {
          setSelectedProduct(prod);
        }}
      />

      {/* Side-by-Side Comparison Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareProducts}
        onRemoveProduct={(id) => {
          setCompareProducts(prev => prev.filter(p => p.id !== id));
        }}
        onSelectProduct={(prod) => {
          setIsCompareModalOpen(false);
          setSelectedProduct(prod);
        }}
      />
    </div>
  );
};

export default App;
