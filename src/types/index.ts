export type CategoryType = 
  | 'All'
  | 'FOOD'
  | 'GROCERY'
  | 'PERSONAL_CARE'
  | 'Snacks & Munchies'
  | 'Breakfast & Cereals'
  | 'Cooking Oils & Ghee'
  | 'Beverages & Juices'
  | 'Staples & Millets'
  | 'Packaged Food' 
  | 'Fruits & Vegetables' 
  | 'Dairy & Beverages' 
  | 'Staples & Grocery' 
  | 'Skincare' 
  | 'Haircare' 
  | 'Personal Care';

export type RiskLevel = 'green' | 'amber' | 'red' | 'grey';

export interface IngredientAnalysis {
  name: string;
  originalText?: string;
  risk: RiskLevel;
  concernType?: 'Nutritional' | 'Preservative / Additive' | 'Allergen / Sensitivity' | 'Endocrine / Carcinogen' | 'Comedogenic / Irritation' | 'General';
  reason: string;
  source: string;
  exposureNote?: string;
  recommendation?: string;
}

export interface NutritionFacts {
  servingSize?: string;
  energyKcal?: number;
  totalSugarG?: number;
  addedSugarG?: number;
  sodiumMg?: number;
  saturatedFatG?: number;
  transFatG?: number;
  proteinG?: number;
  fiberG?: number;
}

export interface SkinSuitability {
  skinTypes: ('Dry' | 'Oily' | 'Combination' | 'Sensitive' | 'Acne-prone')[];
  comedogenicRating?: number; // 0 to 5
  fragranceFree: boolean;
  sulfateFree?: boolean;
  parabenFree?: boolean;
}

export interface SafetyAssessment {
  score: number; // 0.0 to 10.0
  confidence: 'High' | 'Moderate' | 'Low' | 'Insufficient Data';
  breakdown: {
    label: string;
    score: number; // out of 10
    weight: number; // percentage (e.g. 35)
    description: string;
  }[];
  explanation: string;
  limitations: string;
  scoredAt: string;
  scoringVersion: string;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand: string;
  category: CategoryType;
  subcategory: string;
  packageSize: string;
  priceInr?: number; // In ₹, undefined if unavailable
  thumbnailUrl: string;
  imageAttribution?: string;
  ingredients: IngredientAnalysis[];
  rawIngredientsText: string;
  nutritionFacts?: NutritionFacts;
  skinSuitability?: SkinSuitability;
  declaredAllergens: string[];
  safetyAssessment: SafetyAssessment;
  retailerName: string;
  retailerUrl?: string;
  isDemonstrationData: boolean;
  dataSource: string;
  lastUpdated: string;
  freshnessTraceability?: {
    origin?: string;
    farmingType?: 'Organic Certified' | 'Farm Direct' | 'Standard Cultivation';
    shelfLifeDays?: number;
  };
}

export interface UserPreferences {
  skinType?: 'Dry' | 'Oily' | 'Combination' | 'Sensitive' | 'Acne-prone';
  dietary?: ('Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Low-Sugar' | 'Low-Sodium')[];
  fragranceFreePreference: boolean;
}
