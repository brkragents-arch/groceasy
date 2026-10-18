import type { CategoryType, Product, UserPreferences } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { analyzeIngredientText } from '../services/ingredientAnalyzer';
import { calculateSafetyScore } from '../services/scoringEngine';
import { getProductIllustration } from '../utils/productIllustration';

export interface ProductProvider {
  searchProducts(query: string, category?: CategoryType, preferences?: UserPreferences): Promise<Product[]>;
  getTop20(category: CategoryType, preferences?: UserPreferences, query?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  lookupBarcode(barcode: string): Promise<Product | null>;
}

export class MockIndianMarketProvider implements ProductProvider {
  private products: Product[] = MOCK_PRODUCTS;

  async searchProducts(query: string, category?: CategoryType, preferences?: UserPreferences): Promise<Product[]> {
    const q = query.trim().toLowerCase();

    // Map common singular/plural search queries to subcategories & categories
    const normalizedQ = q.replace(/s$/, ''); // e.g. "shampoos" -> "shampoo", "soaps" -> "soap"
    
    const filtered = this.products.filter(product => {
      let matchesCategory = !category || category === 'All' || product.category === category;

      // Grouped umbrella categories
      if (!matchesCategory && category) {
        if (category === 'FOOD') {
          matchesCategory = [
            'Snacks & Munchies',
            'Breakfast & Cereals',
            'Beverages & Juices',
            'Packaged Food',
            'Fruits & Vegetables',
            'Dairy & Beverages'
          ].includes(product.category);
        } else if (category === 'GROCERY') {
          matchesCategory = [
            'Cooking Oils & Ghee',
            'Staples & Millets',
            'Staples & Grocery',
            'Fruits & Vegetables'
          ].includes(product.category);
        } else if (category === 'PERSONAL_CARE' || category === 'Personal Care') {
          matchesCategory = [
            'Personal Care',
            'Haircare',
            'Skincare'
          ].includes(product.category);
        }
      }

      if (!matchesCategory) return false;

      if (!q) return true;

      const subcatLower = product.subcategory.toLowerCase();
      const catLower = product.category.toLowerCase();
      const nameLower = product.name.toLowerCase();
      const brandLower = product.brand.toLowerCase();
      const ingredientsLower = product.rawIngredientsText.toLowerCase();

      // Check direct or singular forms
      let matchesSearch = 
        nameLower.includes(q) || nameLower.includes(normalizedQ) ||
        subcatLower.includes(q) || subcatLower.includes(normalizedQ) ||
        catLower.includes(q) || catLower.includes(normalizedQ) ||
        brandLower.includes(q) ||
        ingredientsLower.includes(q);

      // Intelligent category keyword aliases for quick searches
      if (!matchesSearch) {
        if ((q === 'food' || q === 'foods') && ['Snacks & Munchies', 'Breakfast & Cereals', 'Beverages & Juices', 'Packaged Food', 'Fruits & Vegetables'].includes(product.category)) matchesSearch = true;
        if ((q === 'grocery' || q === 'groceries') && ['Cooking Oils & Ghee', 'Staples & Millets', 'Staples & Grocery'].includes(product.category)) matchesSearch = true;
        if ((q === 'personal_care' || q === 'personal care' || q === 'personal-care' || q === 'cosmetics') && ['Personal Care', 'Haircare', 'Skincare'].includes(product.category)) matchesSearch = true;
        if ((q === 'snack' || q === 'snacks' || q === 'munchies') && product.category === 'Snacks & Munchies') matchesSearch = true;
        if ((q === 'cereal' || q === 'cereals' || q === 'breakfast' || q === 'oat' || q === 'oats') && product.category === 'Breakfast & Cereals') matchesSearch = true;
        if ((q === 'oil' || q === 'oils' || q === 'ghee' || q === 'cooking oil') && product.category === 'Cooking Oils & Ghee') matchesSearch = true;
        if ((q === 'beverage' || q === 'beverages' || q === 'juice' || q === 'juices' || q === 'drink' || q === 'drinks') && product.category === 'Beverages & Juices') matchesSearch = true;
        if ((q === 'staple' || q === 'staples' || q === 'millet' || q === 'millets' || q === 'atta' || q === 'dal') && product.category === 'Staples & Millets') matchesSearch = true;
      }

      return matchesSearch;
    }).filter(product => {
      if (!preferences) return true;
      if (preferences.fragranceFreePreference && product.skinSuitability && !product.skinSuitability.fragranceFree) {
        return false;
      }
      return true;
    });

    // Rank results by quality and safety score descending
    return filtered.sort((a, b) => b.safetyAssessment.score - a.safetyAssessment.score);
  }

  async getTop20(category: CategoryType, preferences?: UserPreferences, query?: string): Promise<Product[]> {
    const list = await this.searchProducts(query || '', category, preferences);
    // Return top 20 ranked products
    return list.slice(0, 20);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async lookupBarcode(barcode: string): Promise<Product | null> {
    const clean = barcode.trim();
    return this.products.find(p => p.barcode === clean) || null;
  }
}

// Extensible Adapter architecture: Allows swapping with live Amazon India Product Advertising API or Open Food Facts
export class ProductService {
  private static instance: ProductService;
  private provider: ProductProvider;

  private constructor() {
    this.provider = new MockIndianMarketProvider();
  }

  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  public setProvider(newProvider: ProductProvider) {
    this.provider = newProvider;
  }

  public search(query: string, category?: CategoryType, preferences?: UserPreferences) {
    return this.provider.searchProducts(query, category, preferences);
  }

  public getTop20(category: CategoryType, preferences?: UserPreferences, query?: string) {
    return this.provider.getTop20(category, preferences, query);
  }

  // Backwards compatibility alias
  public getTop10(category: CategoryType, preferences?: UserPreferences, query?: string) {
    return this.provider.getTop20(category, preferences, query);
  }

  public getById(id: string) {
    return this.provider.getProductById(id);
  }

  public getByBarcode(barcode: string) {
    return this.provider.lookupBarcode(barcode);
  }

  // Allow dynamic manual analysis of any custom label or pasted ingredients
  public analyzeCustomProduct(params: {
    name: string;
    brand: string;
    category: CategoryType;
    rawIngredients: string;
    packageSize: string;
    priceInr?: number;
    customIngredients?: any[];
  }): Product {
    const ingredients = params.customIngredients || analyzeIngredientText(params.rawIngredients);
    const safetyAssessment = calculateSafetyScore(params.category, ingredients);

    // Dynamic matching SVG illustration
    const matchingThumbnail = getProductIllustration(params.name, params.category, params.brand);

    return {
      id: `custom-${Date.now()}`,
      name: params.name,
      brand: params.brand,
      category: params.category,
      subcategory: 'Custom Analyzed Entry',
      packageSize: params.packageSize,
      priceInr: params.priceInr,
      thumbnailUrl: matchingThumbnail,
      ingredients,
      rawIngredientsText: params.rawIngredients,
      declaredAllergens: [],
      safetyAssessment,
      retailerName: 'Custom Entry (SafeScan India)',
      isDemonstrationData: false,
      dataSource: 'Direct User Input Label Extraction (Local Safety Evaluation)',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}
