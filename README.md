# Groceasy — Food, Grocery & Personal Care Safety Scanner

A modern, mobile-first web application designed for Indian consumers to evaluate packaged food, groceries, and personal care products based on ingredient safety, nutritional quality, and formulation standards.

---

## 🚀 Key Features

1. **Groceasy Design Aesthetic**:
   - Signature forest green (`#173D35`) headers with rounded curves (`rounded-b-[2.5rem]`).
   - Clean off-white background (`#F8F9F7`), white rounded product cards, pill filters, and circular category icons.
   - Mobile-first bottom navigation with quick access to Home, Top 20 Rankings, Barcode Scanner, Saved Items, and Ingredient Analyzer.

2. **Organized in Rows**:
   - **Row 1**: Primary Sector Tabs (`ALL`, `FOOD`, `GROCERY`, `PERSONAL_CARE`).
   - **Row 2**: Contextual Subcategory Pills (e.g. Snacks, Breakfast & Oats, Cooking Oils & Ghee, Beverages & Juices, Staples & Millets, Shampoos, Soaps, Moisturizers, Sunscreens).
   - **Department Showcase Rows**: Dedicated horizontal product carousels for FOOD, GROCERY, and PERSONAL_CARE on the home screen.

3. **Amazon India Catalog Integration**:
   - Top 20 items per category with 100% genuine verified Amazon India product photos (`m.media-amazon.com/images/I/...`).
   - Direct links to products on Amazon India with accurate INR pricing (`₹`).
   - Prominent **Brand Name** and **Product Name** display on every card.

4. **Transparent 0–10 Safety Scoring System**:
   - **Packaged Food & Grocery**: Evaluates nutritional profile (added sugar, trans-fat, sodium, fiber, protein), food additives, and synthetic azo dyes (INS 102, 110, 122) against ICMR-NIN 2024 and FSSAI standards.
   - **Cosmetics & Personal Care**: Evaluates ingredient toxicological risk (BIS IS:4707 & EU CosIng), irritation & fragrance allergens, skin type suitability, and comedogenicity.
   - **Fresh Produce**: Emphasizes handling, freshness, and farm traceability without fabricating invisible pesticide data.

5. **Color-Coded Ingredient Risk Breakdown**:
   - **Red**: Substantiated safety hazards or restricted additives (e.g. industrial trans-fats, formaldehyde releasers).
   - **Amber**: Sensitizers, high added sugar, artificial azo dyes, comedogenic oils for acne-prone skin.
   - **Green**: Wholesome, barrier-replenishing, or benign ingredients (e.g., Ceramides, Niacinamide, Whole Rolled Oats).

6. **Barcode Scanner & Local LLM Support**:
   - Live camera viewfinder for retail EAN-13, EAN-8, and UPC-A barcodes with FMCG test presets.
   - Manual custom ingredient analyzer with optional local Ollama LLM deep analysis.
   - Side-by-side comparison modal comparing up to 4 products on safety scores, nutrients, and pricing.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Provider Architecture**: Extensible `ProductProvider` interface ready to connect to Amazon India Product Advertising API (PA-API 5.0) and Open Food Facts.

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```
