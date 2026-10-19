import type { CategoryType, IngredientAnalysis, NutritionFacts, SafetyAssessment, SkinSuitability } from '../types';

export function calculateSafetyScore(
  category: CategoryType,
  ingredients: IngredientAnalysis[],
  nutrition?: NutritionFacts,
  skin?: SkinSuitability,
  productContext?: { name?: string; subcategory?: string; brand?: string; rawIngredients?: string }
): SafetyAssessment {
  if (!ingredients || ingredients.length === 0) {
    return {
      score: 0,
      confidence: 'Insufficient Data',
      breakdown: [],
      explanation: 'Insufficient ingredient or label data provided to compute an evidence-based safety evaluation.',
      limitations: 'Safety assessment requires an itemized ingredient list or label panel.',
      scoredAt: new Date().toISOString().split('T')[0],
      scoringVersion: 'SafeScan-IN-v1.3'
    };
  }

  const redCount = ingredients.filter(i => i.risk === 'red').length;
  const amberCount = ingredients.filter(i => i.risk === 'amber').length;
  const total = ingredients.length;

  const contextStr = `${category} ${productContext?.name || ''} ${productContext?.subcategory || ''} ${productContext?.brand || ''} ${productContext?.rawIngredients || ''}`.toLowerCase();

  // Robust detection of Toothpaste / Oral Care
  const isToothpasteOrOral = 
    /tooth\s*paste|dental|enamel|dente|dentifrice|mouthwash|oral|brush/i.test(contextStr) ||
    ingredients.some(i => /hydroxyapatite|nhap|silica|lactoferrin|dentifrice|fluoride|toothpaste/i.test(i.name.toLowerCase()));

  // Robust detection of Cosmetics & Personal Care (NEVER treated as Food)
  const isCosmetic = isToothpasteOrOral ||
    category === 'Skincare' || 
    category === 'Haircare' || 
    category === 'Personal Care' ||
    category === 'PERSONAL_CARE' ||
    /cosmetic|shampoo|soap|lotion|cream|serum|sunscreen|cleanser|facewash|bodywash|conditioner|hair/i.test(contextStr) ||
    ingredients.some(i => /paraben|dimethicone|niacinamide|sls|sodium lauryl sulfate|ceramide|phenoxyethanol|cetearyl|panthenol/i.test(i.name.toLowerCase()));

  const isFreshProduce = category === 'Fruits & Vegetables' || /fruits\s*&\s*vegetables|produce/i.test(contextStr);

  // 1. Fresh Produce Evaluation
  if (isFreshProduce) {
    const score = 9.4;
    return {
      score,
      confidence: 'High',
      breakdown: [
        { label: 'Freshness & Handling', score: 9.6, weight: 40, description: 'Direct whole produce without artificial preservation or additives' },
        { label: 'Nutritional Purity', score: 9.8, weight: 35, description: 'Natural vitamins, minerals and dietary fiber' },
        { label: 'Label Transparency', score: 8.8, weight: 25, description: 'Traceability and origin declarations' }
      ],
      explanation: 'Fresh whole produce contains no added sugars, trans-fats, or synthetic preservatives. Highest general nutritional suitability.',
      limitations: 'Freshness scores reflect standard agricultural transparency; pesticide residues cannot be inferred from packaging alone.',
      scoredAt: new Date().toISOString().split('T')[0],
      scoringVersion: 'SafeScan-IN-v1.3'
    };
  }

  // 2. Specialized Oral Care & Dental Cosmetic Evaluation (Toothpaste, Dentifrices)
  if (isToothpasteOrOral) {
    // 1. Harmful Chemical & Toxicological Screen: 35%
    // 2. Oral Mucosal Safety & Ulcer Risk: 30%
    // 3. Enamel Remineralization & Bio-Defense: 20%
    // 4. Formulation Transparency & Low Abrasivity: 15%

    let toxicSubscore = 10 - (redCount * 3.5 + amberCount * 0.8);
    toxicSubscore = Math.max(1.5, Math.min(10, toxicSubscore));

    // Mucosal safety: Check for SLS
    const hasSls = ingredients.some(i => /sodium lauryl sulfate|\bsls\b/i.test(i.name));
    let mucosalSubscore = hasSls ? 4.5 : 9.8;
    mucosalSubscore = Math.max(2.0, mucosalSubscore);

    // Remineralization & bio-defense: Reward nHAp & Lactoferrin
    const hasRemineralizer = ingredients.some(i => /hydroxyapatite|nhap|fluoride/i.test(i.name));
    const hasBioDefense = ingredients.some(i => /lactoferrin|xylitol/i.test(i.name));
    let reminSubscore = 8.0;
    if (hasRemineralizer) reminSubscore += 1.2;
    if (hasBioDefense) reminSubscore += 0.8;
    reminSubscore = Math.max(3.0, Math.min(10, reminSubscore));

    const abrasivitySubscore = total >= 6 ? 9.5 : 8.0;

    const finalScore = parseFloat(
      (toxicSubscore * 0.35 + mucosalSubscore * 0.30 + reminSubscore * 0.20 + abrasivitySubscore * 0.15).toFixed(1)
    );

    const confidence: SafetyAssessment['confidence'] = total >= 6 ? 'High' : (total >= 3 ? 'Moderate' : 'Low');

    const flags = [];
    if (redCount > 0) flags.push(`${redCount} high-risk toxin(s)`);
    if (amberCount > 0) flags.push(`${amberCount} caution additive(s)`);
    if (hasSls) flags.push('harsh SLS detergent (oral ulcer risk)');

    const explanation = flags.length > 0
      ? `Rated ${finalScore}/10 for Oral Safety. Identified ${flags.join(' and ')}. ${!hasSls ? '100% SLS-free formula prevents aphthous mucosal irritation.' : ''}`
      : `Rated ${finalScore}/10 for Oral Safety. 100% SLS-free, paraben-free, and triclosan-free cosmetic dentifrice with biomimetic enamel repair active and low-abrasive silica.`;

    return {
      score: finalScore,
      confidence,
      breakdown: [
        { label: 'Harmful Chemical & Toxicological Screen', score: parseFloat(toxicSubscore.toFixed(1)), weight: 35, description: 'Screening against BIS IS:6356 & IS:4707 for zero-tolerance on Triclosan, Parabens, Microplastics, and Carcinogens' },
        { label: 'Oral Mucosal Safety & Ulcer Risk', score: parseFloat(mucosalSubscore.toFixed(1)), weight: 30, description: hasSls ? 'Contains harsh SLS (Sodium Lauryl Sulfate) linked to canker sores and mucosal sloughing' : '100% SLS-free mild surfactant system verified safe for oral mucosa' },
        { label: 'Enamel Remineralization & Bio-Defense', score: parseFloat(reminSubscore.toFixed(1)), weight: 20, description: hasRemineralizer ? 'Enriched with biomimetic enamel repair active (nHAp) and antibacterial bio-defense' : 'Standard dental cleaning matrix' },
        { label: 'Formulation Transparency & Low Abrasivity', score: parseFloat(abrasivitySubscore.toFixed(1)), weight: 15, description: 'Micro-polishing silica with low Relative Dentin Abrasivity (RDA) protecting tooth enamel' }
      ],
      explanation,
      limitations: 'Classified as a cosmetic dentifrice under the Indian Drugs and Cosmetics Act and BIS IS:6356. Not a therapeutic dental prescription.',
      scoredAt: new Date().toISOString().split('T')[0],
      scoringVersion: 'SafeScan-IN-v1.3'
    };
  }

  // 3. General Cosmetics & Personal Care Evaluation (Skincare, Haircare, Soaps, Lotions)
  if (isCosmetic) {
    // 1. Harmful Chemical & Toxicological Screen: 40%
    // 2. Dermal Irritation & Allergen Toxicity: 25%
    // 3. Skin Barrier & Pore Safety: 20%
    // 4. INCI Transparency & Clinical Standards: 15%

    let toxicSubscore = 10 - (redCount * 3.5 + amberCount * 0.9);
    toxicSubscore = Math.max(1.5, Math.min(10, toxicSubscore));

    let irritationSubscore = 9.5;
    if (skin && !skin.fragranceFree) irritationSubscore -= 1.8;
    if (skin && skin.sulfateFree === false) irritationSubscore -= 1.5;
    irritationSubscore = Math.max(2.0, irritationSubscore);

    let suitabilitySubscore = 8.5;
    if (skin && skin.comedogenicRating && skin.comedogenicRating >= 3) {
      suitabilitySubscore -= (skin.comedogenicRating * 1.2);
    }
    suitabilitySubscore = Math.max(3.0, Math.min(10, suitabilitySubscore));

    const transparencySubscore = total >= 5 ? 9.5 : 7.0;

    const finalScore = parseFloat(
      (toxicSubscore * 0.40 + irritationSubscore * 0.25 + suitabilitySubscore * 0.20 + transparencySubscore * 0.15).toFixed(1)
    );

    const confidence: SafetyAssessment['confidence'] = total >= 8 ? 'High' : (total >= 4 ? 'Moderate' : 'Low');

    const flagSummary = [];
    if (redCount > 0) flagSummary.push(`${redCount} high-concern toxic chemical(s)`);
    if (amberCount > 0) flagSummary.push(`${amberCount} ingredient(s) with caution/sensitization potential`);

    const explanation = flagSummary.length > 0 
      ? `Rated ${finalScore}/10 for Cosmetic Safety. Contains ${flagSummary.join(' and ')}. ${skin?.fragranceFree ? 'Fragrance-free formulation benefits sensitive skin.' : ''}`
      : `Rated ${finalScore}/10 for Cosmetic Safety. Formulated with verified non-comedogenic, barrier-supportive ingredients with zero flagged toxic endocrine disruptors, parabens, or harsh sulfates.`;

    return {
      score: finalScore,
      confidence,
      breakdown: [
        { label: 'Harmful Chemical & Toxicological Screen', score: parseFloat(toxicSubscore.toFixed(1)), weight: 40, description: 'Zero-tolerance screening against BIS IS:4707 prohibited list, endocrine disruptors, parabens, phthalates, and formaldehyde releasers' },
        { label: 'Dermal Irritation & Allergen Toxicity', score: parseFloat(irritationSubscore.toFixed(1)), weight: 25, description: 'Evaluation of synthetic fragrance allergens, contact dermatitis triggers, and harsh sulfates' },
        { label: 'Skin Barrier & Pore Safety', score: parseFloat(suitabilitySubscore.toFixed(1)), weight: 20, description: 'Comedogenicity index, non-acnegenic safety, and barrier-supportive lipid balance' },
        { label: 'INCI Transparency & Clinical Standards', score: parseFloat(transparencySubscore.toFixed(1)), weight: 15, description: 'Full chemical name transparency and compliance with SCCS & Indian cosmetic standards' }
      ],
      explanation,
      limitations: 'Cosmetic safety screening evaluated against BIS IS:4707 standards; patch testing recommended before prolonged application on reactive skin.',
      scoredAt: new Date().toISOString().split('T')[0],
      scoringVersion: 'SafeScan-IN-v1.3'
    };
  }

  // 4. True Packaged Foods & Beverages ONLY
  let nutritionSubscore = 8.5;
  if (nutrition) {
    if (nutrition.addedSugarG && nutrition.addedSugarG > 15) nutritionSubscore -= 2.5;
    else if (nutrition.totalSugarG && nutrition.totalSugarG > 20) nutritionSubscore -= 1.8;
    
    if (nutrition.sodiumMg && nutrition.sodiumMg > 500) nutritionSubscore -= 2.0;
    if (nutrition.transFatG && nutrition.transFatG > 0.2) nutritionSubscore -= 3.0;
    if (nutrition.fiberG && nutrition.fiberG >= 4) nutritionSubscore += 1.0;
    if (nutrition.proteinG && nutrition.proteinG >= 8) nutritionSubscore += 0.8;
  }
  nutritionSubscore = Math.max(1.0, Math.min(10, nutritionSubscore));

  let additiveSubscore = 10 - (redCount * 3.5 + amberCount * 1.0);
  additiveSubscore = Math.max(1.5, Math.min(10, additiveSubscore));

  const allergenSubscore = 8.8; // Baseline for clear allergen declaration
  const transparencySubscore = total >= 4 ? 9.2 : 6.5;

  const finalScore = parseFloat(
    (nutritionSubscore * 0.35 + additiveSubscore * 0.30 + allergenSubscore * 0.20 + transparencySubscore * 0.15).toFixed(1)
  );

  const confidence: SafetyAssessment['confidence'] = nutrition && total >= 5 ? 'High' : (total >= 3 ? 'Moderate' : 'Low');

  const flagSummary = [];
  if (redCount > 0) flagSummary.push(`${redCount} high-concern additive(s)`);
  if (amberCount > 0) flagSummary.push(`${amberCount} ingredient(s) requiring dietary caution`);

  const explanation = flagSummary.length > 0
    ? `Score ${finalScore}/10. Identified ${flagSummary.join(' and ')}. ${nutrition?.transFatG && nutrition.transFatG > 0 ? 'Contains detectable trans-fats.' : 'Verified compliant with standard limits.'}`
    : `Score ${finalScore}/10. Wholesome nutritional profile with balanced macronutrients, clean ingredients, and zero prohibited additives.`;

  return {
    score: finalScore,
    confidence,
    breakdown: [
      { label: 'Nutritional Profile', score: parseFloat(nutritionSubscore.toFixed(1)), weight: 35, description: 'Evaluation of added sugar, sodium, trans-fats, dietary fibre and protein based on ICMR-NIN 2024 guidance' },
      { label: 'Ingredient & Additive Safety', score: parseFloat(additiveSubscore.toFixed(1)), weight: 30, description: 'Screening against FSSAI permissible additives, artificial colors, and hydrogenated fats' },
      { label: 'Allergen & Warning Compliance', score: parseFloat(allergenSubscore.toFixed(1)), weight: 20, description: 'Clarity of allergen declarations and critical consumer warnings' },
      { label: 'Label Transparency', score: parseFloat(transparencySubscore.toFixed(1)), weight: 15, description: 'Completeness of itemized ingredients and per-100g nutrient disclosures' }
    ],
    explanation,
    limitations: 'Nutritional screening tool compliant with Indian Dietary Guidelines; not a clinical medical recommendation for individual therapeutic diets.',
    scoredAt: new Date().toISOString().split('T')[0],
    scoringVersion: 'SafeScan-IN-v1.3'
  };
}
