import { TruckStopChain, CabRecipe } from '../types';

export const TRUCK_STOP_CHAINS: TruckStopChain[] = [
  {
    id: 'loves',
    name: "Love's Travel Stops",
    tagline: 'Clean places & friendly faces • Consistent refrigerated deli vault',
    overallHealthGrade: 'B+',
    logoColor: '#E11D48',
    greenLightWins: [
      {
        item: 'Hard-Boiled Egg 2-Packs',
        category: 'Protein Vault',
        macros: '12g Pro • 1g Carb • 10g Fat (140 kcal)',
        proTip: 'Deli cooler staple. Pair with mustard or black pepper from the condiment counter for zero-calorie flavor.'
      },
      {
        item: 'Fresh Cut Cantaloupe / Watermelon & Berry Cups',
        category: 'Produce & Fresh',
        macros: '2g Pro • 22g Carb • 0g Fat (90 kcal)',
        proTip: 'Provides high potassium and cellular water to counteract road dehydration without bloating.'
      },
      {
        item: 'Chomps Grass-Fed Beef Sticks / Jack Link\'s Zero-Sugar Jerky',
        category: 'Protein Vault',
        macros: '18g Pro • 0g Carb • 8g Fat (140 kcal)',
        proTip: 'Pure protein without the corn syrup glaze found on standard teriyaki jerky.'
      },
      {
        item: 'Chobani Complete or Oikos Triple Zero Greek Yogurt',
        category: 'Protein Vault',
        macros: '20g-25g Pro • 10g Carb • 0g Fat (140 kcal)',
        proTip: 'Contains live probiotic cultures to heal gut microbiome disrupted by vibration and sitting.'
      },
      {
        item: 'BodyArmor Lyte / Electrolit Zero',
        category: 'Hydration & Electrolytes',
        macros: '0g Pro • 4g Carb • 0g Fat (20 kcal)',
        proTip: 'High potassium and magnesium replenishment after hot tire checks.'
      }
    ],
    yellowLightCautious: [
      {
        item: 'Roller Grill Jalapeño Cheddar Sausage',
        caveat: '14g protein, but carries over 780mg sodium and processed nitrates. Only use in emergencies.'
      },
      {
        item: 'Pre-Packaged Chef Salads',
        caveat: 'Great greens and turkey, but the ranch dressing packet contains 280 calories of soybean oil. Toss the dressing and ask for mustard and lemon.'
      },
      {
        item: 'Subway Fresh Forward (inside Love\'s)',
        caveat: 'Order double turkey on whole grain flatbread or as a protein bowl; skip the mayo and sweet onion sauces.'
      }
    ],
    redLightTraps: [
      {
        item: 'Roller Grill Tornados & Egg Rolls',
        hazard: 'Deep-fried trans-fats that cause extreme postprandial sleepiness and highway brain fog 45 minutes down the road.'
      },
      {
        item: '44oz Mega Fountain Sodas',
        hazard: 'Over 130g of high-fructose corn syrup—instant insulin spike followed by a severe crash behind the wheel.'
      },
      {
        item: 'Iced Cinnamon Rolls / Honey Buns',
        hazard: '600+ empty calories with zero protein; triggers immediate intestinal inflammation.'
      }
    ],
    ajVerdict: 'AJ Risner: "Love\'s has the most reliable fresh fruit and clean Greek yogurt stock on Interstate corridors. Head straight to the center cold vault, skip the hot roller island entirely."'
  },
  {
    id: 'pilot-flying-j',
    name: 'Pilot Flying J',
    tagline: 'High volume freight hubs • P.J. Fresh Market stations',
    overallHealthGrade: 'B',
    logoColor: '#EA580C',
    greenLightWins: [
      {
        item: 'PJ Fresh Rotisserie Roasted Chicken Breast',
        category: 'Protein Vault',
        macros: '38g Pro • 0g Carb • 9g Fat (240 kcal)',
        proTip: 'Ask the deli counter for plain roasted chicken breast without sweet barbecue glaze.'
      },
      {
        item: 'Wholly Guacamole + Raw Carrot & Celery Sticks',
        category: 'Produce & Fresh',
        macros: '2g Pro • 14g Carb • 9g Fat (140 kcal)',
        proTip: 'Healthy monounsaturated fat that curbs appetite for 3 to 4 hours while driving.'
      },
      {
        item: 'Sargento Balanced Breaks (Nuts & White Cheddar)',
        category: 'Quick Fuel',
        macros: '7g Pro • 11g Carb • 11g Fat (170 kcal)',
        proTip: 'Pre-portioned so you don\'t accidentally mindlessly eat 800 calories of nuts on cruise control.'
      },
      {
        item: 'Core Power Elite 42g High-Protein Fairlife Milk',
        category: 'Protein Vault',
        macros: '42g Pro • 8g Carb • 4.5g Fat (230 kcal)',
        proTip: 'Lactose-free, ultra-filtered cold protein. The fastest 42g protein hit on the Interstate.'
      },
      {
        item: 'Wonderful Roasted & Salted Pistachios (In-Shell)',
        category: 'Quick Fuel',
        macros: '12g Pro • 16g Carb • 26g Fat (320 kcal / serving)',
        proTip: 'In-shell pistachios slow down your eating pace by 50% while operating the rig.'
      }
    ],
    yellowLightCautious: [
      {
        item: 'Hot Bar Pulled Pork (No Bun)',
        caveat: 'Decent protein source if barbecue sauce is scraped off, but watch for added brown sugar brine.'
      },
      {
        item: 'Canned Campbell\'s Chunky Sirloin Burger Soup',
        caveat: 'Can be heated in truck microwave; reliable protein but packs 1,500mg sodium per can.'
      }
    ],
    redLightTraps: [
      {
        item: 'PJ Fresh Stuffed Crust Pizza Slices',
        hazard: 'Packs 420 calories and 22g of saturated fat per slice. Two slices will induce instant lethargy.'
      },
      {
        item: 'Loaded Roller Grill Smoked Sausages',
        hazard: 'Excess sodium draws water out of cellular circulation, creating painful ankle edema in the cab.'
      }
    ],
    ajVerdict: 'AJ Risner: "Pilot\'s PJ Fresh counters usually stock rotisserie chicken or carved turkey. Pair that with a Core Power 42g shake and you have a 70g protein meal without touching grease."'
  },
  {
    id: 'ta-petro',
    name: 'TravelCenters of America / Petro',
    tagline: 'Sit-down Iron Skillet / Country Pride restaurants with full customization',
    overallHealthGrade: 'A-',
    logoColor: '#2563EB',
    greenLightWins: [
      {
        item: 'Iron Skillet / Country Pride Custom Sirloin & Steamed Veggies',
        category: 'Protein Vault',
        macros: '48g Pro • 12g Carb • 14g Fat (360 kcal)',
        proTip: 'Order 8oz top sirloin dry (no butter splash), double steamed broccoli, baked potato dry.'
      },
      {
        item: '3-Egg Omelet with Spinach, Mushrooms & Diced Ham',
        category: 'Protein Vault',
        macros: '32g Pro • 4g Carb • 20g Fat (320 kcal)',
        proTip: 'Ask the cook for real eggs instead of boxed liquid mix and dry hash browns or tomato slices.'
      },
      {
        item: 'Deli Cold Case Raw Nut Mix & String Cheese',
        category: 'Quick Fuel',
        macros: '14g Pro • 8g Carb • 16g Fat (220 kcal)',
        proTip: 'Raw almonds and walnuts contain anti-inflammatory omega-3s to protect heart health.'
      }
    ],
    yellowLightCautious: [
      {
        item: 'Buffet Salad Bar',
        caveat: 'Fantastic for raw greens, beets, hardboiled eggs, and garbanzo beans; beware of potato/macaroni salads swimming in soybean mayo.'
      }
    ],
    redLightTraps: [
      {
        item: 'Country Fried Steak with Sausage Gravy',
        hazard: 'Over 1,200 calories and 65g fat; heavily bready and causes rapid drowsiness on night hauls.'
      }
    ],
    ajVerdict: 'AJ Risner: "TA/Petro gives you the biggest tactical advantage because you can talk to an actual cook. Ask for unbuttered steak and steamed broccoli and you beat 95% of road diets."'
  },
  {
    id: 'bucees',
    name: "Buc-ee's Travel Centers",
    tagline: 'Massive Texas-sized facility • Legendary deli and jerky counter',
    overallHealthGrade: 'B',
    logoColor: '#F59E0B',
    greenLightWins: [
      {
        item: 'Fresh Sliced Smoked Turkey Breast (Butcher Counter)',
        category: 'Protein Vault',
        macros: '40g Pro • 2g Carb • 4g Fat (210 kcal)',
        proTip: 'Order it sliced by the pound at the central meat carving station. Pure lean smokehouse poultry.'
      },
      {
        item: 'Buc-ee\'s Signature Ghost Pepper or Bohemian Garlic Beef Jerky',
        category: 'Protein Vault',
        macros: '30g Pro • 6g Carb • 3g Fat (170 kcal / serving)',
        proTip: 'The dry-rub jerky varieties have much lower sugar than the sweet glazed versions.'
      },
      {
        item: 'Fresh In-House Fruit & Veggie Shakers (Pre-washed)',
        category: 'Produce & Fresh',
        macros: '3g Pro • 18g Carb • 0g Fat (80 kcal)',
        proTip: 'Crunchy celery, cucumber coins, and snap peas keep jaws working and drivers awake without caffeine.'
      }
    ],
    yellowLightCautious: [
      {
        item: 'Chopped Brisket Sandwich',
        caveat: 'Great smoked beef, but the heavy sweet sauce packs 35g of pure sugar. Ask for brisket sliced dry with sauce on the side.'
      }
    ],
    redLightTraps: [
      {
        item: 'Beaver Nuggets (Caramel Corn Puffs)',
        hazard: 'A single bag has over 1,000 calories of pure corn syrup and palm oil. Highly addictive sugar bomb.'
      }
    ],
    ajVerdict: 'AJ Risner: "At Buc-ee\'s, hit the meat carving station for smoked turkey by the pound and grab dry Bohemian garlic jerky. Steer clear of the candy aisles."'
  },
  {
    id: 'kwik-trip',
    name: 'Kwik Trip / Kwik Star (Midwest Corridor)',
    tagline: 'Midwest driver favorite • Fresh bananas at wholesale and clean kitchens',
    overallHealthGrade: 'A',
    logoColor: '#059669',
    greenLightWins: [
      {
        item: 'Kwik Trip 5-Pack Hard Boiled Eggs & String Cheese',
        category: 'Protein Vault',
        macros: '36g Pro • 2g Carb • 25g Fat (380 kcal)',
        proTip: 'One of the best values on the road; kept super fresh with rapid inventory turnover.'
      },
      {
        item: 'Single Bananas (38¢ to 49¢ per lb)',
        category: 'Produce & Fresh',
        macros: '1g Pro • 27g Carb • 0g Fat (105 kcal)',
        proTip: 'Cheapest natural potassium in America. Calms muscle cramps from clutch and pedal foot wear.'
      },
      {
        item: 'Kitchen Cravings Grilled Chicken Strips',
        category: 'Protein Vault',
        macros: '28g Pro • 1g Carb • 3g Fat (150 kcal)',
        proTip: 'Tender grilled chicken ready to toss into a cab salad or eat cold on the road.'
      }
    ],
    yellowLightCautious: [
      {
        item: 'Fried Chicken Tenders (Deli Case)',
        caveat: 'High quality meat, but the crispy batter adds 18g fat per 3 tenders. Peel the breading off.'
      }
    ],
    redLightTraps: [
      {
        item: 'Glazer Donuts (6-pack for $2.49)',
        hazard: 'Cheap and dangerously accessible at checkout; instant brain fog trigger.'
      }
    ],
    ajVerdict: 'AJ Risner: "If your route runs through Wisconsin, Minnesota, or Iowa, Kwik Trip is the undisputed king of cheap fresh fruit and high-protein kitchen essentials."'
  }
];

export const CAB_GALLEY_RECIPES: CabRecipe[] = [
  {
    id: 'recipe-1',
    title: '12V RoadPro Skillet Flank Steak & Garlic Green Beans',
    subtitle: 'Zero restaurant markup • High-protein muscle repair inside your cab',
    appliance: '12V RoadPro Skillet / Lunchbox',
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    shelfLifeBunk: 'Keep flank steak in 12V cooler at 38°F up to 4 days',
    proteinGrams: 46,
    carbGrams: 8,
    fatGrams: 14,
    calories: 345,
    sodiumMg: 420,
    ingredients: [
      '8 oz lean flank steak or top sirloin strips',
      '1.5 cups fresh pre-washed trimmed green beans (from Love\'s or Walmart stop)',
      '1 tsp avocado oil or olive oil',
      '1 tsp garlic powder & coarse black pepper',
      '1 tbsp low-sodium soy sauce or coconut aminos'
    ],
    instructions: [
      'Plug your 12V skillet or lunchbox cooker into the bunk auxiliary power socket 5 minutes before cooking.',
      'Lightly coat base with 1 tsp oil, place steak strips in a single layer.',
      'Toss green beans around steak, sprinkle garlic powder, coarse pepper, and drizzle soy sauce.',
      'Close lid securely. Let sizzle for 18–20 minutes until steak reaches desired doneness and green beans are tender-crisp.',
      'Eat directly from skillet or onto bunk plate. Total cleanup: 1 wet paper towel wipe.'
    ],
    ajCoachingCue: 'AJ Risner: "Flank steak is naturally lean and holds up remarkably well in a 12V cooler. Cooking this in your sleeper saves you $25 compared to an Interstate diner."'
  },
  {
    id: 'recipe-2',
    title: '4-Minute Inverter Microwave High-Protein Bunk Scramble',
    subtitle: 'Instant morning launch • No stove required • Zero greasy pans',
    appliance: 'Truck Inverter Microwave',
    prepTimeMinutes: 2,
    cookTimeMinutes: 3,
    shelfLifeBunk: 'Carton liquid egg whites last 30+ days in truck fridge',
    proteinGrams: 38,
    carbGrams: 6,
    fatGrams: 8,
    calories: 250,
    sodiumMg: 380,
    ingredients: [
      '1 cup liquid egg whites (carton from grocery stop)',
      '1 whole fresh egg (for choline and fat-soluble vitamins)',
      '1 cup raw baby spinach leaves',
      '2 tbsp pre-crumbled feta or low-fat cheddar cheese',
      'Dash hot sauce or salsa packet'
    ],
    instructions: [
      'Spray a microwave-safe ceramic coffee mug or bowl with cooking spray.',
      'Pour 1 cup egg whites, crack whole egg, and beat lightly with plastic fork.',
      'Tear raw spinach into bowl and push into egg mixture.',
      'Microwave on HIGH for 90 seconds. Stir with fork to fluff curds.',
      'Microwave another 60 to 75 seconds until firm. Top with feta and salsa.'
    ],
    ajCoachingCue: 'AJ Risner: "Carton egg whites are an OTR driver\'s superpower: zero mess, pasteurized, high density protein, and impossible to break during cab vibration."'
  },
  {
    id: 'recipe-3',
    title: '4-Hour Sleeper Berth Slow Cooker Salsa Verde Chicken Shred',
    subtitle: 'Cooks while you log 200 miles • Walk into sleeper to fresh hot shredded poultry',
    appliance: 'Mini Slow Cooker / Air Fryer',
    prepTimeMinutes: 3,
    cookTimeMinutes: 240,
    shelfLifeBunk: 'Yields 4 servings; keeps 5 days in 12V cooler',
    proteinGrams: 52,
    carbGrams: 10,
    fatGrams: 6,
    calories: 310,
    sodiumMg: 520,
    ingredients: [
      '1.5 lbs raw boneless skinless chicken breasts',
      '1 jar (16oz) salsa verde (tomatillo sauce has natural tenderizing acids)',
      '1 tbsp cumin & chili powder blend',
      '1 can black beans (rinsed and drained, optional high-fiber booster)'
    ],
    instructions: [
      'Secure portable slow cooker in lower sleeper berth or storage cubby with a bungee cord so it doesn\'t slide.',
      'Place raw chicken breasts in slow cooker, pour salsa verde over top, sprinkle cumin.',
      'Turn slow cooker to LOW setting powered by bunk inverter.',
      'Drive your 4-hour stint. When you shut down for your 30-min DOT break, shred chicken with two forks.',
      'Serve over microwave minute brown rice or high-fiber low-carb tortillas.'
    ],
    ajCoachingCue: 'AJ Risner: "The smell of home-cooked salsa chicken when you open your sleeper curtain will instantly kill any urge to walk into the truck stop fast food counter."'
  },
  {
    id: 'recipe-4',
    title: 'The Overnight Sleeper Bunk Chia-Oats Protein Vault',
    subtitle: 'Zero heat required • Eat cold while rolling out before dawn',
    appliance: 'No-Cook 12V Cooler',
    prepTimeMinutes: 4,
    cookTimeMinutes: 0,
    shelfLifeBunk: 'Rolled oats & chia seeds stay shelf-stable in dry bunk bin for 12 months',
    proteinGrams: 42,
    carbGrams: 45,
    fatGrams: 11,
    calories: 440,
    sodiumMg: 190,
    ingredients: [
      '1/2 cup rolled old-fashioned oats',
      '1 scoop vanilla or chocolate whey/casein protein powder',
      '1 tbsp chia seeds (omega-3 and soluble gut fiber)',
      '1 cup unsweetened almond milk or Fairlife ultra-filtered milk',
      '1 tbsp natural peanut butter or handful of blueberries'
    ],
    instructions: [
      'In a wide-mouth shaker bottle or mason jar, add dry oats, protein powder, and chia seeds.',
      'Pour milk over ingredients and shake vigorously for 15 seconds.',
      'Stir in peanut butter or fruit.',
      'Place in 12V cab cooler before going to sleep in the bunk.',
      'In the morning, the oats and chia seeds will have absorbed the liquid into a thick, delicious protein porridge. Grab and drive.'
    ],
    ajCoachingCue: 'AJ Risner: "Chia seeds expand to 10x their size in fluid, slowly releasing hydration into your bloodstream during your first 3 hours behind the wheel."'
  },
  {
    id: 'recipe-5',
    title: 'High-Fiber Mediterranean Lemon Tuna & Avocado Mash',
    subtitle: 'Zero appliances needed • Instant 3-minute fuel stop lunch',
    appliance: 'No-Cook 12V Cooler',
    prepTimeMinutes: 3,
    cookTimeMinutes: 0,
    shelfLifeBunk: 'Canned tuna foil pouches require zero refrigeration until opened',
    proteinGrams: 36,
    carbGrams: 14,
    fatGrams: 16,
    calories: 340,
    sodiumMg: 410,
    ingredients: [
      '2 foil pouches (5 oz total) chunk light tuna or salmon in water (no can opener needed)',
      '1/2 ripe avocado (healthy fats for hormone stability)',
      '1 tbsp lemon juice packet or yellow mustard',
      '1/4 tsp coarse cracked black pepper & garlic salt',
      'Whole grain rye crisps or high-fiber tortilla wrap'
    ],
    instructions: [
      'Tear open tuna foil pouches and empty into a paper bowl or directly onto a tortilla.',
      'Scoop half an avocado and mash it into the tuna using a plastic fork instead of processed mayonnaise.',
      'Add lemon juice, cracked pepper, and garlic salt.',
      'Eat with rye crisps or wrapped in a tortilla.',
      'Immediate clean up: fold paper bowl and dispose.'
    ],
    ajCoachingCue: 'AJ Risner: "Avocado replaces inflammatory seed-oil mayonnaise with clean potassium and monounsaturated fat that lubricates your joints."'
  }
];
