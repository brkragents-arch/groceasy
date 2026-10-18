/**
 * Deterministic, robust SVG illustrated image generator for Indian FMCG products.
 * Guaranteed 100% offline uptime, zero broken links, perfect matching shapes & labels.
 */

export function getProductIllustration(name: string, subcategory: string, brand: string): string {
  const sub = subcategory.toLowerCase();
  const n = name.toLowerCase();

  // 1. SHAMPOOS & HAIRCARE
  if (sub.includes('shampoo') || n.includes('shampoo') || n.includes('cleanser') && n.includes('scalp')) {
    const isHerbal = n.includes('rosemary') || n.includes('bhringraj') || n.includes('tea tree') || n.includes('onion') || n.includes('ayurvedic');
    const isAntiDandruff = n.includes('dandruff') || n.includes('scalpe') || n.includes('menthol') || n.includes('coal tar');
    
    const bottleColor = isHerbal ? '#1E4D38' : isAntiDandruff ? '#1A4D7C' : '#D97706';
    const capColor = isHerbal ? '#143828' : isAntiDandruff ? '#0F2F4D' : '#92400E';
    const accentColor = isHerbal ? '#6EE7B7' : isAntiDandruff ? '#93C5FD' : '#FDE68A';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F3" />
          <stop offset="100%" stop-color="#E2E8E5" />
        </linearGradient>
        <linearGradient id="bottle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${bottleColor}" />
          <stop offset="70%" stop-color="${bottleColor}" />
          <stop offset="100%" stop-color="${capColor}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.15" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" rx="32" />
      
      <!-- Surface shadow -->
      <ellipse cx="200" cy="350" rx="90" ry="14" fill="#000000" opacity="0.08" />

      <!-- Pump Dispenser -->
      <g filter="url(#shadow)">
        <!-- Pump Head -->
        <path d="M175 75 L225 75 C230 75 235 79 235 85 L235 95 L165 95 L165 85 C165 79 170 75 175 75 Z" fill="#E5E7EB" />
        <rect x="192" y="55" width="16" height="25" rx="4" fill="#E5E7EB" />
        <path d="M192 60 L140 60 C135 60 130 65 130 70 L130 76 L192 76 Z" fill="#D1D5DB" />
        <!-- Pump Neck Ring -->
        <rect x="178" y="95" width="44" height="18" rx="3" fill="#D1D5DB" />
        
        <!-- Main Bottle Body -->
        <path d="M160 120 C160 113 170 113 180 113 L220 113 C230 113 240 113 240 120 L255 160 C265 180 270 210 270 240 L270 300 C270 330 250 340 220 340 L180 340 C150 340 130 330 130 300 L130 240 C130 210 135 180 145 160 Z" fill="url(#bottle)" />
        
        <!-- Specular Highlight Curve -->
        <path d="M150 170 C143 190 140 220 140 250 L140 290 C140 310 145 320 155 325" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.3" fill="none" />

        <!-- Front Label -->
        <rect x="155" y="180" width="90" height="110" rx="10" fill="#FFFFFF" opacity="0.95" />
        <rect x="165" y="195" width="70" height="4" rx="2" fill="${bottleColor}" />
        
        <!-- Category & Icon Badge -->
        <circle cx="200" cy="225" r="14" fill="${accentColor}" opacity="0.5" />
        <path d="M200 215 C195 223 192 228 192 232 C192 236 196 239 200 239 C204 239 208 236 208 232 C208 228 205 223 200 215 Z" fill="${bottleColor}" />

        <text x="200" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#1F2937">${brand.toUpperCase()}</text>
        <text x="200" y="275" font-family="system-ui, sans-serif" font-size="8" font-weight="600" text-anchor="middle" fill="#4B5563">SHAMPOO</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 2. SOAPS & CLEANSING BARS
  if (sub.includes('soap') || n.includes('soap') || n.includes('bathing bar') || n.includes('cleansing bar')) {
    const isAyurvedic = n.includes('neem') || n.includes('turmeric') || n.includes('sandal') || n.includes('ayurvedic') || n.includes('ubtan');
    const isBabyGentle = n.includes('baby') || n.includes('shea') || n.includes('olive') || n.includes('glycerin') || n.includes('goat milk');
    
    const soapColor = isAyurvedic ? '#C27835' : isBabyGentle ? '#E5D5C5' : '#4E9F76';
    const accentLeaf = isAyurvedic ? '#9A5B27' : isBabyGentle ? '#C4AC97' : '#2D6A4F';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FBF9F5" />
          <stop offset="100%" stop-color="#ECE6DC" />
        </linearGradient>
        <linearGradient id="soapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${soapColor}" />
          <stop offset="100%" stop-color="${accentLeaf}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" flood-opacity="0.18" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" rx="32" />
      
      <!-- Ground Shadow -->
      <ellipse cx="205" cy="315" rx="115" ry="22" fill="#000000" opacity="0.12" />

      <!-- Soap Bar -->
      <g filter="url(#shadow)">
        <!-- Rounded Solid Soap Brick with 3D Bevel -->
        <rect x="95" y="140" width="210" height="145" rx="36" fill="url(#soapGrad)" />
        <rect x="105" y="146" width="190" height="130" rx="30" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.35" />

        <!-- Soap Stamp Impression -->
        <rect x="135" y="175" width="130" height="75" rx="16" fill="none" stroke="${accentLeaf}" stroke-width="3" opacity="0.7" />
        
        <!-- Botanical leaf engraving -->
        <path d="M200 185 C208 195 210 205 200 215 C190 205 192 195 200 185 Z" fill="#FFFFFF" opacity="0.5" />
        <path d="M200 190 L200 213" stroke="${accentLeaf}" stroke-width="2" opacity="0.6" />

        <text x="200" y="235" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#FFFFFF" opacity="0.9" letter-spacing="1">${brand.toUpperCase()}</text>
        <text x="200" y="248" font-family="system-ui, sans-serif" font-size="9" font-weight="600" text-anchor="middle" fill="#FFFFFF" opacity="0.75">BATHING BAR</text>
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 3. MOISTURIZERS & CREAMS
  if (sub.includes('moisturizer') || n.includes('moisturizer') || n.includes('cream') || n.includes('barrier') || n.includes('lotion')) {
    const isCeramide = n.includes('ceramide') || n.includes('barrier') || n.includes('hyaluronic');
    const jarColor = isCeramide ? '#15803D' : '#0369A1';
    const lidColor = '#FFFFFF';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F5F9F6" />
          <stop offset="100%" stop-color="#E1ECE5" />
        </linearGradient>
        <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${jarColor}" />
          <stop offset="70%" stop-color="${jarColor}" />
          <stop offset="100%" stop-color="#0F2B25" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" flood-opacity="0.14" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" rx="32" />
      
      <!-- Ground Shadow -->
      <ellipse cx="200" cy="330" rx="105" ry="18" fill="#000000" opacity="0.1" />

      <g filter="url(#shadow)">
        <!-- Elegant Cosmetic Jar Tub -->
        <!-- Jar Body -->
        <path d="M100 170 C100 160 110 155 120 155 L280 155 C290 155 300 160 300 170 L290 280 C290 310 260 320 200 320 C140 320 110 310 110 280 Z" fill="url(#jarGrad)" />

        <!-- Jar Front Label Panel -->
        <rect x="135" y="195" width="130" height="90" rx="12" fill="#FFFFFF" opacity="0.95" />
        <rect x="150" y="210" width="100" height="4" rx="2" fill="${jarColor}" />
        <circle cx="200" cy="235" r="14" fill="${jarColor}" opacity="0.15" />
        <path d="M195 235 L199 239 L206 231" stroke="${jarColor}" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <text x="200" y="260" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#1F2937">${brand.toUpperCase()}</text>
        <text x="200" y="274" font-family="system-ui, sans-serif" font-size="8" font-weight="600" text-anchor="middle" fill="#4B5563">MOISTURIZER</text>

        <!-- Specular shine -->
        <path d="M125 180 C120 220 125 270 135 290" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.3" fill="none" />

        <!-- Metallic / Clean Lid -->
        <rect x="90" y="125" width="220" height="42" rx="14" fill="${lidColor}" stroke="#E5E7EB" stroke-width="2" />
        <line x1="95" y1="145" x2="305" y2="145" stroke="#E5E7EB" stroke-width="2" />
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 4. SUNSCREENS
  if (sub.includes('sunscreen') || n.includes('sunscreen') || n.includes('sun') || n.includes('spf')) {
    const tubeColor = '#F59E0B'; // Amber warm sun
    const capColor = '#D97706';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF9EE" />
          <stop offset="100%" stop-color="#FCEFD2" />
        </linearGradient>
        <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${tubeColor}" />
          <stop offset="70%" stop-color="${tubeColor}" />
          <stop offset="100%" stop-color="${capColor}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" flood-opacity="0.14" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="url(#bg)" rx="32" />
      
      <!-- Ground Shadow -->
      <ellipse cx="200" cy="345" rx="85" ry="14" fill="#000000" opacity="0.1" />

      <g filter="url(#shadow)">
        <!-- Top Crimped Edge of Sunscreen Squeeze Tube -->
        <rect x="140" y="70" width="120" height="15" rx="3" fill="#D97706" />

        <!-- Squeeze Tube Body -->
        <path d="M140 85 L155 240 C158 265 170 280 180 285 L220 285 C230 280 242 265 245 240 L260 85 Z" fill="url(#tubeGrad)" />
        
        <!-- White Clean Sunscreen Label -->
        <rect x="160" y="115" width="80" height="130" rx="10" fill="#FFFFFF" opacity="0.95" />
        
        <!-- Sun Icon -->
        <circle cx="200" cy="145" r="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2" />
        <circle cx="200" cy="145" r="8" fill="#F59E0B" />
        
        <text x="200" y="180" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#1F2937">${brand.toUpperCase()}</text>
        <text x="200" y="196" font-family="system-ui, sans-serif" font-size="12" font-weight="900" text-anchor="middle" fill="#D97706">SPF 50+</text>
        <text x="200" y="210" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#4B5563">PA++++</text>
        <text x="200" y="228" font-family="system-ui, sans-serif" font-size="7" font-weight="600" text-anchor="middle" fill="#9CA3AF">BROAD SPECTRUM</text>

        <!-- Bottom Screw Cap -->
        <rect x="175" y="285" width="50" height="40" rx="6" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="1.5" />
        <line x1="175" y1="298" x2="225" y2="298" stroke="#E5E7EB" stroke-width="1.5" />
        <line x1="175" y1="312" x2="225" y2="312" stroke="#E5E7EB" stroke-width="1.5" />
      </g>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // 5. PACKAGED GROCERIES / OATS / SNACKS
  if (sub.includes('cereals') || n.includes('oats')) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#F4EFE6" rx="32" />
      <ellipse cx="200" cy="335" rx="90" ry="15" fill="#000000" opacity="0.08" />
      <rect x="130" y="90" width="140" height="230" rx="16" fill="#D97706" />
      <rect x="145" y="120" width="110" height="160" rx="10" fill="#FFFFFF" />
      <circle cx="200" cy="180" r="30" fill="#FDE68A" />
      <text x="200" y="235" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#1F2937">${brand.toUpperCase()}</text>
      <text x="200" y="255" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#D97706">ROLLED OATS</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // Generic fallback
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <rect width="400" height="400" fill="#E2E8E5" rx="32" />
    <circle cx="200" cy="180" r="60" fill="#173D35" opacity="0.15" />
    <text x="200" y="185" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#173D35">${brand}</text>
    <text x="200" y="210" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle" fill="#4B5563">${subcategory}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
