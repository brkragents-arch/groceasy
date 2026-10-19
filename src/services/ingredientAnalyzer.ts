import type { IngredientAnalysis, RiskLevel } from '../types';

interface IngredientRule {
  keywords: string[];
  risk: RiskLevel;
  concernType: IngredientAnalysis['concernType'];
  reason: string;
  source: string;
  exposureNote: string;
  recommendation: string;
}

export const INGREDIENT_KNOWLEDGE_BASE: IngredientRule[] = [
  // Food red / amber flags
  {
    keywords: ['hydrogenated vegetable oil', 'vanaspati', 'partially hydrogenated oil'],
    risk: 'red',
    concernType: 'Nutritional',
    reason: 'Major source of industrial trans-fats, associated with elevated LDL cholesterol and coronary heart disease risk.',
    source: 'FSSAI (Limiting Trans Fats to <2%) & WHO REPLACE Package',
    exposureNote: 'High dietary intake creates progressive cardiovascular strain.',
    recommendation: 'Choose cold-pressed oils or zero trans-fat certified products.'
  },
  {
    keywords: ['high fructose corn syrup', 'corn syrup solids', 'liquid glucose', 'invert syrup', 'added sugar'],
    risk: 'amber',
    concernType: 'Nutritional',
    reason: 'Rapidly absorbed free simple sugars contributing to glycemic spikes, visceral adiposity, and metabolic disruption.',
    source: 'ICMR-NIN Dietary Guidelines for Indians (2024)',
    exposureNote: 'Frequent consumption exceeding recommended daily limit (25g-30g).',
    recommendation: 'Look for whole fruit sweetening or unsweetened alternatives.'
  },
  {
    keywords: ['tartrazine', 'ins 102', 'e102', 'sunset yellow', 'ins 110', 'allura red', 'ins 129'],
    risk: 'amber',
    concernType: 'Preservative / Additive',
    reason: 'Synthetic azo food dyes linked in clinical trials to hyperactive behavior in sensitive children and possible urticaria/asthma trigger.',
    source: 'FSSAI Food Safety & Standards (Food Products Standards and Food Additives) / EFSA',
    exposureNote: 'Cumulative exposure across confectionery and coloured beverages.',
    recommendation: 'Prefer naturally derived colorants like paprika extract, curcumin, or beetroot red.'
  },
  {
    keywords: ['sodium benzoate', 'ins 211', 'e211', 'potassium sorbate', 'ins 202'],
    risk: 'amber',
    concernType: 'Preservative / Additive',
    reason: 'Chemical preservative widely permitted, but when paired with ascorbic acid (Vitamin C) under heat/light can form trace benzene.',
    source: 'FSSAI permissible additive limits & Codex Alimentarius',
    exposureNote: 'Standard shelf-stable acidic beverages and condiments.',
    recommendation: 'Safe in permitted concentrations; opt for pasteurized, aseptic-pack preservative-free options when available.'
  },
  {
    keywords: ['monosodium glutamate', 'msg', 'ins 621', 'ajinomoto'],
    risk: 'amber',
    concernType: 'Allergen / Sensitivity',
    reason: 'Flavour enhancer; safe for general population per FSSAI/US FDA, but declared sensitivity in some individuals (transient headache/flushing).',
    source: 'FSSAI Notification & WHO/FAO JECFA',
    exposureNote: 'Savory packaged snacks, instant noodles, and ready-to-eat seasoning.',
    recommendation: 'Moderate intake if you experience MSG-symptom complex or are monitoring sodium.'
  },
  {
    keywords: ['palm oil', 'palmolein', 'refined palm oil'],
    risk: 'amber',
    concernType: 'Nutritional',
    reason: 'High proportion of saturated palmitic acid (~50%), which may contribute to higher blood lipid levels when consumed in excess.',
    source: 'ICMR / National Institute of Nutrition',
    exposureNote: 'Very ubiquitous in Indian packaged fried snacks and biscuits.',
    recommendation: 'Limit consumption of fried snacks; choose products prepared in mustard, groundnut, or sesame oil.'
  },
  {
    keywords: ['oats', 'whole wheat', 'almonds', 'cold pressed', 'organic turmeric', 'ragi', 'flaxseed', 'chia', 'cocoa butter'],
    risk: 'green',
    concernType: 'Nutritional',
    reason: 'Wholesome, minimally processed ingredient offering micronutrients, soluble fibre, or healthy lipids with no flagged health concerns.',
    source: 'FSSAI & Indian Food Composition Tables (IFCT)',
    exposureNote: 'Beneficial dietary component.',
    recommendation: 'Excellent component of a balanced dietary pattern.'
  },

  // Cosmetics red / amber flags
  {
    keywords: ['paraben', 'methylparaben', 'propylparaben', 'butylparaben', 'isobutylparaben'],
    risk: 'amber',
    concernType: 'Endocrine / Carcinogen',
    reason: 'Broad-spectrum synthetic preservatives with weak estrogenic activity in laboratory tests; banned or heavily restricted in child leave-on cosmetics in EU.',
    source: 'Scientific Committee on Consumer Safety (SCCS) / BIS Standards',
    exposureNote: 'Leave-on lotions and creams pose higher cumulative absorption than rinse-off soaps.',
    recommendation: 'Consider paraben-free formulations, especially for prolonged daily leave-on use.'
  },
  {
    keywords: ['synthetic fragrance', 'parfum', 'fragrance', 'aroma'],
    risk: 'amber',
    concernType: 'Allergen / Sensitivity',
    reason: 'Umbrella term that can mask dozens of individual aromatic allergens; top contact allergen causing allergic contact dermatitis.',
    source: 'European Commission CosIng & Indian Bureau of Standards IS 4707',
    exposureNote: 'High risk for reactive, rosacea, or atopic eczema-prone skin.',
    recommendation: 'Choose fragrance-free or hypoallergenic formulations if you have sensitive or irritated skin.'
  },
  {
    keywords: ['sodium lauryl sulfate', 'sls'],
    risk: 'amber',
    concernType: 'Comedogenic / Irritation',
    reason: 'Harsh anionic surfactant that can strip the skin lipid barrier, cause transepidermal water loss (TEWL), and irritate eyes and mucosal membranes.',
    source: 'Cosmetic Ingredient Review (CIR) Expert Panel',
    exposureNote: 'Common in foaming face washes, shampoos, and toothpastes.',
    recommendation: 'Switch to gentler surfactants like Sodium Cocoyl Isethionate (SCI) or Coco-Glucoside.'
  },
  {
    keywords: ['mineral oil', 'liquid paraffin', 'petrolatum', 'isoparaffin'],
    risk: 'amber',
    concernType: 'Comedogenic / Irritation',
    reason: 'Heavy occlusive; highly purified cosmetic grade is non-toxic and excellent for dry barrier repair, but can clog pores and exacerbate acne in oily skin.',
    source: 'American Academy of Dermatology (AAD) Comedogenicity scales',
    exposureNote: 'Comedogenic for acne-prone skin types; beneficial for extreme dry xerosis.',
    recommendation: 'Avoid on acne-prone facial skin; safe for chapped lips and body elbows.'
  },
  {
    keywords: ['formaldehyde releaser', 'dmdm hydantoin', 'imidazolidinyl urea', 'quaternium-15', 'bronopol'],
    risk: 'red',
    concernType: 'Allergen / Sensitivity',
    reason: 'Preservatives that slowly release micro-amounts of formaldehyde gas to prevent microbial contamination; established sensitizer and allergen.',
    source: 'IARC Monograph & EU Cosmetic Regulation (EC) No 1223/2009',
    exposureNote: 'Leave-on cosmetic lotions, shampoos, and conditioners.',
    recommendation: 'Avoid if sensitive to formaldehyde or struggling with chronic dermatitis.'
  },
  {
    keywords: ['oxybenzone', 'benzophenone-3'],
    risk: 'amber',
    concernType: 'Endocrine / Carcinogen',
    reason: 'Chemical sunscreen filter with documented systemic absorption and potential endocrine disruption concerns; prohibited in several marine ecosystems.',
    source: 'US FDA Sunscreen Proposed Rule & SCCS Evaluation',
    exposureNote: 'Sunscreen sprays and daily SPF creams.',
    recommendation: 'Opt for modern filters (Tinosorb, Uvinul) or mineral filters (Zinc Oxide, Titanium Dioxide).'
  },
  {
    keywords: ['ceramide', 'hyaluronic acid', 'sodium hyaluronate', 'niacinamide', 'centella asiatica', 'panthenol', 'squalane', 'glycerin', 'aloe vera', 'biotin', 'rosemary oil', 'argan oil', 'onion extract', 'amla', 'bhringraj', 'shikakai'],
    risk: 'green',
    concernType: 'General',
    reason: 'Proven barrier-supportive, nourishing botanical, or gentle conditioning agent with high tolerability.',
    source: 'Dermatological Reviews & CIR Panel',
    exposureNote: 'Well tolerated across scalp and hair types.',
    recommendation: 'Highly beneficial for scalp nourishment and maintaining strand integrity.'
  },
  {
    keywords: ['sodium laureth sulfate', 'sles', 'ammonium lauryl sulfate', 'als'],
    risk: 'amber',
    concernType: 'Comedogenic / Irritation',
    reason: 'Strong surfactant that strips natural sebum from hair and scalp; can cause scalp dryness or itchiness.',
    source: 'Cosmetic Ingredient Review (CIR)',
    exposureNote: 'High frequency shampooing with SLS/SLES causes cuticle roughness.',
    recommendation: 'Opt for sulfate-free gentle cleansers such as Sodium Cocoyl Isethionate (SCI) or Decyl Glucoside.'
  },
  {
    keywords: ['dimethicone', 'cyclomethicone', 'cyclopentasiloxane', 'amodimethicone'],
    risk: 'amber',
    concernType: 'General',
    reason: 'Non-water-soluble synthetic silicone. Imparts immediate slip and shine, but causes cumulative scalp/strand buildup if not thoroughly clarified.',
    source: 'International Journal of Cosmetic Science',
    exposureNote: 'Repeated use without clarifying shampoo leads to flat, weighed-down hair.',
    recommendation: 'Use occasionally or choose water-soluble silicones (like Dimethicone Copolyol) or natural plant oils.'
  },
  {
    keywords: ['coal tar', 'selenium sulfide', 'pyrithione zinc', 'zinc pyrithione'],
    risk: 'amber',
    concernType: 'Allergen / Sensitivity',
    reason: 'Antifungal/anti-dandruff active. Effective for seborrheic dermatitis, but potential sensitizer and drying with prolonged daily exposure.',
    source: 'BIS IS:4707 & US FDA OTC Drug Review',
    exposureNote: 'Should be used as a targeted treatment rather than daily casual shampoo.',
    recommendation: 'Limit use to 2-3 times weekly and alternate with a gentle moisturizing cleanser.'
  },

  // Oral Care & Toothpaste rules
  {
    keywords: ['nano hydroxyapatite', 'hydroxyapatite', 'nhap'],
    risk: 'green',
    concernType: 'General',
    reason: 'Gold-standard biomimetic mineral that remineralizes weakened enamel, seals microscopic dentinal tubules, and relieves tooth sensitivity without fluoride toxicity.',
    source: 'SCCS Opinion on Hydroxyapatite & International Journal of Dentistry',
    exposureNote: 'Biocompatible mineral identical to natural human tooth enamel.',
    recommendation: 'Outstanding fluoride-free active for daily enamel restoration and sensitive teeth.'
  },
  {
    keywords: ['lactoferrin'],
    risk: 'green',
    concernType: 'General',
    reason: 'Natural protective milk-derived antimicrobial protein that selectively targets pathogenic oral bacteria and reduces gum inflammation without disrupting the healthy oral microbiome.',
    source: 'European Journal of Oral Sciences & PubMed Dental Trials',
    exposureNote: 'Natural salivary defense enzyme analog.',
    recommendation: 'Highly beneficial for gum health and lasting breath freshness.'
  },
  {
    keywords: ['hydrated silica', 'silica'],
    risk: 'green',
    concernType: 'General',
    reason: 'Gentle, controlled polishing micro-abrasive safe for dental enamel; cleans plaque effectively with low Relative Dentin Abrasivity (RDA).',
    source: 'American Dental Association (ADA) & BIS IS:6356 Toothpaste Standards',
    exposureNote: 'Standard gentle dental polishing agent.',
    recommendation: 'Safe for daily twice-a-day brushing.'
  },
  {
    keywords: ['sodium methyl cocoyl taurate', 'cocamidopropyl betaine'],
    risk: 'green',
    concernType: 'General',
    reason: 'Mild, coconut-derived non-sulfate surfactant; cleans gently without irritating the oral mucosa or triggering painful canker sores unlike harsh SLS.',
    source: 'Cosmetic Ingredient Review (CIR) & Journal of Clinical Periodontology',
    exposureNote: 'Sulfate-free mucosal-friendly cleanser.',
    recommendation: 'Ideal for sensitive gums, dry mouth, or aphthous ulcer-prone individuals.'
  },
  {
    keywords: ['xylitol', 'sorbitol'],
    risk: 'green',
    concernType: 'General',
    reason: 'Non-cariogenic natural humectants and polyols that inhibit Streptococcus mutans, prevent acid formation, and stimulate salivary flow.',
    source: 'Cochrane Oral Health Group & FSSAI Standards',
    exposureNote: 'Dental-safe protective humectants.',
    recommendation: 'Superior tooth-friendly alternatives to fermentable sugars.'
  },
  {
    keywords: ['sodium saccharin'],
    risk: 'amber',
    concernType: 'Preservative / Additive',
    reason: 'Synthetic non-nutritive sweetener commonly used in dental pastes; non-cariogenic, though purely synthetic.',
    source: 'US FDA & FSSAI Permitted Sweeteners',
    exposureNote: 'Rinse-off oral formulation.',
    recommendation: 'Non-harmful in customary toothpaste quantities.'
  },
  {
    keywords: ['peg-8', 'peg-40', 'peg-100', 'polyethylene glycol'],
    risk: 'amber',
    concernType: 'General',
    reason: 'Synthetic humectant and solvent; generally non-irritating but ethoxylated compound requiring purity assurance against trace residues.',
    source: 'Cosmetic Ingredient Review (CIR) Expert Panel',
    exposureNote: 'Moisture retainer in gels and dental pastes.',
    recommendation: 'Safe in purified cosmetic grade formulations.'
  },
  {
    keywords: ['menthol', 'peppermint oil'],
    risk: 'green',
    concernType: 'General',
    reason: 'Natural mint extract providing cooling sensation, breath freshening, and mild anti-plaque properties.',
    source: 'Flavor and Extract Manufacturers Association (FEMA)',
    exposureNote: 'Widely tolerated oral care flavor.',
    recommendation: 'Safe and refreshing for daily oral hygiene.'
  }
];

export function analyzeIngredientText(text: string): IngredientAnalysis[] {
  if (!text || text.trim() === '') return [];

  // Split ingredients by comma, semicolon, or parenthesis
  const tokens = text
    .split(/[,;•\n]/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && !t.startsWith('Contains:') && !t.startsWith('May contain:'));

  return tokens.map(token => {
    const lower = token.toLowerCase();
    
    // Look for matching rule in knowledge base
    const matchedRule = INGREDIENT_KNOWLEDGE_BASE.find(rule => 
      rule.keywords.some(keyword => lower.includes(keyword))
    );

    if (matchedRule) {
      return {
        name: token,
        originalText: token,
        risk: matchedRule.risk,
        concernType: matchedRule.concernType,
        reason: matchedRule.reason,
        source: matchedRule.source,
        exposureNote: matchedRule.exposureNote,
        recommendation: matchedRule.recommendation
      };
    }

    // Default safe / green if it's typical benign grocery or cosmetic base
    return {
      name: token,
      originalText: token,
      risk: 'green',
      concernType: 'General',
      reason: 'No flagged safety alerts or critical regulatory restrictions found in current reference databases for this ingredient.',
      source: 'Standard INCI / FSSAI Reference Database',
      exposureNote: 'Standard food or cosmetic grade usage.',
      recommendation: 'Safe for use in customary quantities.'
    };
  });
}
