const https = require('https');
const fs = require('fs');

const itemsToFetch = [
  // --- SNACKS & MUNCHIES ---
  { id: 'snack-01', query: 'Farmley Roasted Flavored Makhana Peri Peri 100g' },
  { id: 'snack-02', query: 'True Elements 7 in 1 Super Seeds and Nut Mix 250g' },
  { id: 'snack-03', query: 'The Whole Truth Dark Chocolate Hazelnut Bar' },
  { id: 'snack-04', query: 'Open Secret Unjunked Choco Almond Nutty Cookies' },
  { id: 'snack-05', query: 'Nutty Gritties Roasted California Almonds Lightly Salted' },
  { id: 'snack-06', query: 'Prov Premium California Walnut Kernels' },
  { id: 'snack-07', query: 'Too Yumm Karare Munchy Masala' },
  { id: 'snack-08', query: 'Cornitos Nacho Crisps Cheese and Herbs' },
  { id: 'snack-09', query: 'Haldirams Nagpur Aloo Bhujia' },
  { id: 'snack-10', query: '4700BC Gourmet Popcorn Himalayan Salt Caramel' },
  { id: 'snack-11', query: 'Lays Magic Masala Potato Chips 50g' },
  { id: 'snack-12', query: 'Britannia NutriChoice Digestive High Fibre Biscuits' },
  { id: 'snack-13', query: 'Kurkure Masala Munch' },
  { id: 'snack-14', query: 'Sunfeast Dark Fantasy Choco Fills' },
  { id: 'snack-15', query: 'Haldirams All in One Namkeen' },
  { id: 'snack-16', query: 'Britannia Good Day Butter Cookies' },
  { id: 'snack-17', query: 'Oreo Original Vanilla Creme Biscuit' },
  { id: 'snack-18', query: 'Parle G Original Gluco Biscuits' },
  { id: 'snack-19', query: 'Bingo Mad Angles Achaari Masti' },
  { id: 'snack-20', query: 'Tong Garden Salted Cashew Nuts' },

  // --- BREAKFAST & CEREALS ---
  { id: 'cereal-01', query: 'True Elements Rolled Oats 100% Wholegrain Gluten Free 1kg' },
  { id: 'cereal-02', query: 'Quaker Rolled Oats 1kg pouch' },
  { id: 'cereal-03', query: 'Yoga Bar 100% Rolled Oats 1kg' },
  { id: 'cereal-04', query: 'Pintola All Natural Creamy Peanut Butter 1kg' },
  { id: 'cereal-05', query: 'Monsoon Harvest Toasted Millet Granola' },
  { id: 'cereal-06', query: 'Slurrp Farm Ragi Chocolate Cereal for Kids' },
  { id: 'cereal-07', query: 'Kelloggs Muesli 0% Added Sugar with Nuts & Seeds' },
  { id: 'cereal-08', query: 'Bagrrys Organic Certified Rolled Oats' },
  { id: 'cereal-09', query: 'Alpino Natural Peanut Butter Crunch' },
  { id: 'cereal-10', query: 'Dabur 100% Pure Honey Squeezy' },
  { id: 'cereal-11', query: 'The Whole Truth High Protein Dark Chocolate Muesli' },
  { id: 'cereal-12', query: 'Kelloggs Corn Flakes Original' },
  { id: 'cereal-13', query: 'Saffola Masala Oats Classic Masala' },
  { id: 'cereal-14', query: 'Kelloggs Chocos Chocolate Wheat Cereal' },
  { id: 'cereal-15', query: 'Soulfull Ragi Bites Choco Fills' },
  { id: 'cereal-16', query: 'MyFitness High Protein Peanut Butter Chocolate' },
  { id: 'cereal-17', query: 'Bagrrys Choco Flakes Breakfast Cereal' },
  { id: 'cereal-18', query: 'Patanjali Traditional Dalia Broken Wheat' },
  { id: 'cereal-19', query: 'Kapiva Pure Organic Raw Honey' },
  { id: 'cereal-20', query: 'Nestle NesPlus Multigrain Crunchy Granola' },

  // --- COOKING OILS & GHEE ---
  { id: 'oil-01', query: 'Anveshan Wood Pressed Groundnut Oil 1L' },
  { id: 'oil-02', query: 'Two Brothers Organic Farms A2 Desi Cow Cultured Ghee' },
  { id: 'oil-03', query: 'Organic India Cold Pressed Virgin Mustard Oil 1L' },
  { id: 'oil-04', query: 'Coco Soul 100% Pure Cold Pressed Virgin Coconut Oil' },
  { id: 'oil-05', query: 'Borges Extra Virgin Olive Oil 1L' },
  { id: 'oil-06', query: 'Figaro Pure Olive Oil Tin 1L' },
  { id: 'oil-07', query: 'Fortune Kachi Ghani Pure Mustard Oil 1L' },
  { id: 'oil-08', query: 'Amul Pure Desi Ghee Tin 1L' },
  { id: 'oil-09', query: 'Mother Dairy Pure Ghee Pouch 1L' },
  { id: 'oil-10', query: 'Aashirvaad Svasti Pure Cow Ghee 1L' },
  { id: 'oil-11', query: 'Saffola Gold Pro Healthy Blend Oil 1L' },
  { id: 'oil-12', query: 'Gulab Wood Pressed Sesame Til Oil' },
  { id: 'oil-13', query: 'Fortune Sunlite Refined Sunflower Oil 1L' },
  { id: 'oil-14', query: 'Dhara Kachi Ghani Mustard Oil 1L' },
  { id: 'oil-15', query: 'Engine Brand Pure Kachi Ghani Mustard Oil' },
  { id: 'oil-16', query: 'Patanjali Cow Ghee Tin 1L' },
  { id: 'oil-17', query: 'Emami Healthy & Tasty Rice Bran Oil' },
  { id: 'oil-18', query: 'Gemini Pure Edible Refined Sunflower Oil' },
  { id: 'oil-19', query: 'PureRoots Mustard Oil Kachi Ghani' },
  { id: 'oil-20', query: 'Dalda Vanaspati Ghee Cooking Fat' },

  // --- BEVERAGES & JUICES ---
  { id: 'bev-01', query: 'Raw Pressery 100% Cold Pressed Valencia Orange Juice' },
  { id: 'bev-02', query: 'Organic India Tulsi Green Tea Classic 25 Tea Bags' },
  { id: 'bev-03', query: 'Paper Boat 100% Tender Coconut Water' },
  { id: 'bev-04', query: 'Vahdam Himalayan Green Tea Pure Long Leaf' },
  { id: 'bev-05', query: 'Kapiva Pure Wild Amla Juice 1L' },
  { id: 'bev-06', query: 'Blue Tokai Specialty Roasted Ground Coffee' },
  { id: 'bev-07', query: 'Tata Tea Gold Long Leaf Tea 500g' },
  { id: 'bev-08', query: 'Paper Boat Aam Panna Traditional Drink' },
  { id: 'bev-09', query: 'Real Fruit Power 100% Mixed Fruit Juice 1L' },
  { id: 'bev-10', query: 'Nescafe Classic Instant Pure Coffee 100g' },
  { id: 'bev-11', query: 'Tropicana 100% Pomegranate Apple Delight Juice' },
  { id: 'bev-12', query: 'Red Label Natural Care Tea 500g' },
  { id: 'bev-13', query: 'Amul Kool Kesar Badam Milk Can' },
  { id: 'bev-14', query: 'Rooh Afza Herbal Concentrated Sharbat 750ml' },
  { id: 'bev-15', query: 'Frooti Mango Drink 1.2L Pet Bottle' },
  { id: 'bev-16', query: 'Maaza Mango Pulp Juice 1.2L' },
  { id: 'bev-17', query: 'Coca Cola Original Taste Soft Drink Can' },
  { id: 'bev-18', query: 'Thums Up Charged Carbonated Beverage' },
  { id: 'bev-19', query: 'Red Bull Energy Drink 250ml Can' },
  { id: 'bev-20', query: 'Sting Energy Drink 250ml Pet Bottle' },

  // --- STAPLES & MILLETS ---
  { id: 'staple-01', query: 'Two Brothers Organic Farms Khapli Wheat Flour' },
  { id: 'staple-02', query: 'Organic Tattva Organic Foxtail Millet Kangni 500g' },
  { id: 'staple-03', query: '24 Mantra Organic Unpolished Toor Dal 1kg' },
  { id: 'staple-04', query: 'Natureland Organics Certified Brown Basmati Rice 1kg' },
  { id: 'staple-05', query: 'Tata Sampann Unpolished Moong Dal Chilka' },
  { id: 'staple-06', query: 'Aashirvaad Select Sharbati Whole Wheat Atta 5kg' },
  { id: 'staple-07', query: 'India Gate Classic Basmati Rice 1kg' },
  { id: 'staple-08', query: 'Tata Salt Vaccum Evaporated Iodized Salt 1kg' },
  { id: 'staple-09', query: 'Organic Tattva Organic Ragi Flour 500g' },
  { id: 'staple-10', query: 'True Elements Gluten Free Quinoa Seeds 500g' },
  { id: 'staple-11', query: 'Catch Pink Rock Salt Sendha Namak 1kg' },
  { id: 'staple-12', query: 'Tata Sampann High Protein Chana Dal 1kg' },
  { id: 'staple-13', query: 'Nutrela 100% Vegetarian High Protein Soya Chunks' },
  { id: 'staple-14', query: 'Patanjali Traditional Whole Wheat Chakki Atta 10kg' },
  { id: 'staple-15', query: 'Fortune Arhar Tur Dal Polish Free 1kg' },
  { id: 'staple-16', query: 'Daawat Rozana Gold Basmati Rice 5kg' },
  { id: 'staple-17', query: 'Aashirvaad Multi Millets Flour Mix 1kg' },
  { id: 'staple-18', query: 'Organic India Certified Organic Jaggery Powder Gur' },
  { id: 'staple-19', query: 'Fortune Maida Super Refined All Purpose Flour' },
  { id: 'staple-20', query: 'Madhur Pure Refined Crystal Sugar 1kg' }
];

function fetchImage(item) {
  return new Promise((resolve) => {
    const url = 'https://www.amazon.in/s?k=' + encodeURIComponent(item.query);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    https.get(url, options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = data.match(/https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+?)\._AC_UL[0-9]+_\.jpg/g) ||
                        data.match(/https:\/\/m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+%-]+?)\.[a-zA-Z0-9_-]+\.jpg/g);
        if (matches && matches.length > 0) {
          const m = matches[0].match(/images\/I\/([A-Za-z0-9+%-]+?)\./);
          const rawId = m ? m[1] : null;
          if (rawId) {
            const imgUrl = 'https://m.media-amazon.com/images/I/' + rawId + '._SL600_.jpg';
            // verify image returns 200
            https.get(imgUrl, imgRes => {
              if (imgRes.statusCode === 200) {
                resolve({ id: item.id, url: imgUrl, ok: true });
              } else {
                resolve({ id: item.id, url: null, ok: false, status: imgRes.statusCode });
              }
            }).on('error', () => resolve({ id: item.id, url: null, ok: false }));
            return;
          }
        }
        resolve({ id: item.id, url: null, ok: false, reason: 'no-match' });
      });
    }).on('error', e => resolve({ id: item.id, url: null, ok: false, reason: e.message }));
  });
}

async function run() {
  console.log(`Starting fetch for ${itemsToFetch.length} products...`);
  const results = {};
  
  // Fetch in batches of 5 to be polite and fast
  for (let i = 0; i < itemsToFetch.length; i += 5) {
    const chunk = itemsToFetch.slice(i, i + 5);
    const chunkResults = await Promise.all(chunk.map(fetchImage));
    for (const r of chunkResults) {
      if (r.ok && r.url) {
        results[r.id] = r.url;
        console.log(`[OK] ${r.id} => ${r.url}`);
      } else {
        console.log(`[FAIL] ${r.id} => ${r.reason || r.status}`);
      }
    }
    // slight delay between chunks
    await new Promise(res => setTimeout(res, 500));
  }

  fs.writeFileSync('src/data/downloadedFoodImages.json', JSON.stringify(results, null, 2));
  console.log(`Done! Saved ${Object.keys(results).length} images to src/data/downloadedFoodImages.json`);
}

run();
