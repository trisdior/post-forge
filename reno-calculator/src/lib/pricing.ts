import { 
  ProjectType, 
  RoomSize, 
  QualityLevel, 
  CalculatorState, 
  CostEstimate,
  KitchenOptions,
  BathroomOptions,
  FlooringOptions,
  PaintingOptions
} from './types';

// Base pricing for Chicago 2026 market
const BASE_PRICING = {
  kitchen: {
    budget: { low: 8000, mid: 11500, high: 15000 },
    'mid-range': { low: 15000, mid: 25000, high: 35000 },
    premium: { low: 35000, mid: 55000, high: 75000 },
  },
  bathroom: {
    budget: { low: 5000, mid: 7500, high: 10000 },
    'mid-range': { low: 10000, mid: 17500, high: 25000 },
    premium: { low: 25000, mid: 37500, high: 50000 },
  },
  flooring: {
    // Per sq ft pricing
    carpet: { budget: 3, mid: 5.5, high: 8 },
    lvp: { budget: 5, mid: 8.5, high: 12 },
    hardwood: { budget: 8, mid: 14, high: 20 },
    tile: { budget: 10, mid: 17.5, high: 25 },
  },
  painting: {
    // Per room pricing
    budget: { low: 200, mid: 350, high: 500 },
    'mid-range': { low: 400, mid: 600, high: 800 },
    premium: { low: 600, mid: 1050, high: 1500 },
  },
  'full-remodel': {
    budget: { low: 30000, mid: 45000, high: 60000 },
    'mid-range': { low: 60000, mid: 105000, high: 150000 },
    premium: { low: 150000, mid: 225000, high: 300000 },
  },
  other: {
    budget: { low: 5000, mid: 10000, high: 15000 },
    'mid-range': { low: 15000, mid: 30000, high: 45000 },
    premium: { low: 45000, mid: 75000, high: 100000 },
  },
};

// Size multipliers
const SIZE_MULTIPLIERS: Record<RoomSize, number> = {
  small: 0.75,
  medium: 1.0,
  large: 1.4,
};

// Kitchen option multipliers (additive, based on mid-range costs)
const KITCHEN_OPTION_COSTS = {
  cabinets: 8000,
  countertops: 4000,
  backsplash: 1500,
  appliances: 5000,
  plumbing: 3000,
  electrical: 2500,
};

// Bathroom option multipliers
const BATHROOM_OPTION_COSTS = {
  tubShower: 4000,
  vanity: 2500,
  tile: 3000,
  fixtures: 1500,
  plumbing: 2500,
};

// Timeline estimates in weeks
const TIMELINE_ESTIMATES = {
  kitchen: {
    small: { min: 3, max: 5 },
    medium: { min: 4, max: 7 },
    large: { min: 6, max: 10 },
  },
  bathroom: {
    small: { min: 2, max: 3 },
    medium: { min: 3, max: 5 },
    large: { min: 4, max: 7 },
  },
  flooring: {
    small: { min: 1, max: 2 },
    medium: { min: 2, max: 4 },
    large: { min: 3, max: 6 },
  },
  painting: {
    small: { min: 1, max: 2 },
    medium: { min: 2, max: 3 },
    large: { min: 3, max: 5 },
  },
  'full-remodel': {
    small: { min: 8, max: 12 },
    medium: { min: 12, max: 20 },
    large: { min: 16, max: 28 },
  },
  other: {
    small: { min: 2, max: 4 },
    medium: { min: 4, max: 8 },
    large: { min: 6, max: 12 },
  },
};

function calculateKitchenCost(
  options: KitchenOptions | undefined,
  quality: QualityLevel,
  size: RoomSize
): { low: number; mid: number; high: number } {
  const baseCost = BASE_PRICING.kitchen[quality];
  const sizeMultiplier = SIZE_MULTIPLIERS[size];
  
  let optionCost = 0;
  if (options) {
    const qualityMultiplier = quality === 'budget' ? 0.6 : quality === 'premium' ? 1.5 : 1.0;
    Object.entries(options).forEach(([key, selected]) => {
      if (selected && key in KITCHEN_OPTION_COSTS) {
        optionCost += KITCHEN_OPTION_COSTS[key as keyof typeof KITCHEN_OPTION_COSTS] * qualityMultiplier;
      }
    });
  }
  
  return {
    low: Math.round((baseCost.low * sizeMultiplier) + (optionCost * 0.8)),
    mid: Math.round((baseCost.mid * sizeMultiplier) + optionCost),
    high: Math.round((baseCost.high * sizeMultiplier) + (optionCost * 1.2)),
  };
}

function calculateBathroomCost(
  options: BathroomOptions | undefined,
  quality: QualityLevel,
  size: RoomSize
): { low: number; mid: number; high: number } {
  const baseCost = BASE_PRICING.bathroom[quality];
  const sizeMultiplier = SIZE_MULTIPLIERS[size];
  
  let optionCost = 0;
  if (options) {
    const qualityMultiplier = quality === 'budget' ? 0.6 : quality === 'premium' ? 1.5 : 1.0;
    Object.entries(options).forEach(([key, selected]) => {
      if (selected && key in BATHROOM_OPTION_COSTS) {
        optionCost += BATHROOM_OPTION_COSTS[key as keyof typeof BATHROOM_OPTION_COSTS] * qualityMultiplier;
      }
    });
  }
  
  return {
    low: Math.round((baseCost.low * sizeMultiplier) + (optionCost * 0.8)),
    mid: Math.round((baseCost.mid * sizeMultiplier) + optionCost),
    high: Math.round((baseCost.high * sizeMultiplier) + (optionCost * 1.2)),
  };
}

function calculateFlooringCost(
  options: FlooringOptions | undefined,
  quality: QualityLevel
): { low: number; mid: number; high: number } {
  if (!options) {
    return { low: 2000, mid: 4000, high: 6000 };
  }
  
  const materialPricing = BASE_PRICING.flooring[options.materialType];
  const qualityMultiplier = quality === 'budget' ? 0.8 : quality === 'premium' ? 1.3 : 1.0;
  const sqft = options.sqft || (options.roomCount * 200); // Estimate 200 sq ft per room
  
  return {
    low: Math.round(sqft * materialPricing.budget * qualityMultiplier),
    mid: Math.round(sqft * materialPricing.mid * qualityMultiplier),
    high: Math.round(sqft * materialPricing.high * qualityMultiplier),
  };
}

function calculatePaintingCost(
  options: PaintingOptions | undefined,
  quality: QualityLevel
): { low: number; mid: number; high: number } {
  if (!options) {
    return { low: 800, mid: 1600, high: 2400 };
  }
  
  const perRoom = BASE_PRICING.painting[quality];
  const roomCount = options.roomCount || 4;
  const typeMultiplier = options.type === 'both' ? 1.8 : options.type === 'exterior' ? 1.5 : 1.0;
  const prepMultiplier = options.prepWork === 'extensive' ? 1.4 : options.prepWork === 'moderate' ? 1.2 : 1.0;
  
  return {
    low: Math.round(perRoom.low * roomCount * typeMultiplier * prepMultiplier),
    mid: Math.round(perRoom.mid * roomCount * typeMultiplier * prepMultiplier),
    high: Math.round(perRoom.high * roomCount * typeMultiplier * prepMultiplier),
  };
}

export function calculateEstimate(state: CalculatorState): CostEstimate {
  const { projectType, roomSize, qualityLevel, projectOptions } = state;
  
  if (!projectType || !roomSize || !qualityLevel) {
    return {
      low: 0,
      mid: 0,
      high: 0,
      breakdown: {
        materials: { low: 0, mid: 0, high: 0 },
        labor: { low: 0, mid: 0, high: 0 },
        permits: { low: 0, mid: 0, high: 0 },
        contingency: { low: 0, mid: 0, high: 0 },
      },
      timelineWeeks: { min: 0, max: 0 },
    };
  }
  
  let totalCost: { low: number; mid: number; high: number };
  
  switch (projectType) {
    case 'kitchen':
      totalCost = calculateKitchenCost(projectOptions.kitchen, qualityLevel, roomSize);
      break;
    case 'bathroom':
      totalCost = calculateBathroomCost(projectOptions.bathroom, qualityLevel, roomSize);
      break;
    case 'flooring':
      totalCost = calculateFlooringCost(projectOptions.flooring, qualityLevel);
      break;
    case 'painting':
      totalCost = calculatePaintingCost(projectOptions.painting, qualityLevel);
      break;
    case 'full-remodel':
    case 'other':
    default:
      const baseCost = BASE_PRICING[projectType] || BASE_PRICING.other;
      const sizeMultiplier = SIZE_MULTIPLIERS[roomSize];
      totalCost = {
        low: Math.round(baseCost[qualityLevel].low * sizeMultiplier),
        mid: Math.round(baseCost[qualityLevel].mid * sizeMultiplier),
        high: Math.round(baseCost[qualityLevel].high * sizeMultiplier),
      };
  }
  
  // Calculate breakdown (typical percentages)
  const breakdown = {
    materials: {
      low: Math.round(totalCost.low * 0.40),
      mid: Math.round(totalCost.mid * 0.40),
      high: Math.round(totalCost.high * 0.40),
    },
    labor: {
      low: Math.round(totalCost.low * 0.45),
      mid: Math.round(totalCost.mid * 0.45),
      high: Math.round(totalCost.high * 0.45),
    },
    permits: {
      low: Math.round(totalCost.low * 0.05),
      mid: Math.round(totalCost.mid * 0.05),
      high: Math.round(totalCost.high * 0.05),
    },
    contingency: {
      low: Math.round(totalCost.low * 0.10),
      mid: Math.round(totalCost.mid * 0.10),
      high: Math.round(totalCost.high * 0.10),
    },
  };
  
  // Get timeline estimate
  const timelineData = TIMELINE_ESTIMATES[projectType] || TIMELINE_ESTIMATES.other;
  const timelineWeeks = timelineData[roomSize];
  
  return {
    ...totalCost,
    breakdown,
    timelineWeeks,
  };
}

// Chicago area zip codes (partial list)
const CHICAGO_AREA_ZIPS = [
  // Chicago proper
  '60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610',
  '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620',
  '60621', '60622', '60623', '60624', '60625', '60626', '60628', '60629', '60630', '60631',
  '60632', '60633', '60634', '60636', '60637', '60638', '60639', '60640', '60641', '60642',
  '60643', '60644', '60645', '60646', '60647', '60649', '60651', '60652', '60653', '60654',
  '60655', '60656', '60657', '60659', '60660', '60661', '60664', '60666', '60668', '60669',
  // Suburbs
  '60004', '60005', '60007', '60008', '60010', '60016', '60018', '60025', '60026', '60043',
  '60053', '60056', '60062', '60067', '60068', '60074', '60076', '60077', '60091', '60093',
  '60101', '60103', '60104', '60106', '60107', '60108', '60120', '60126', '60130', '60131',
  '60133', '60137', '60139', '60148', '60153', '60154', '60155', '60160', '60162', '60163',
  '60164', '60165', '60171', '60176', '60181', '60187', '60189', '60191', '60193', '60194',
  '60195', '60201', '60202', '60203', '60301', '60302', '60304', '60305', '60402', '60406',
  '60409', '60411', '60419', '60422', '60425', '60426', '60428', '60429', '60430', '60438',
  '60439', '60443', '60445', '60448', '60453', '60455', '60456', '60457', '60458', '60459',
  '60461', '60462', '60463', '60464', '60465', '60466', '60467', '60469', '60471', '60472',
  '60473', '60475', '60476', '60477', '60478', '60480', '60482', '60487', '60490', '60491',
];

export function isChicagoArea(zipCode: string): boolean {
  const cleanZip = zipCode.replace(/\D/g, '').slice(0, 5);
  // Check if it's in our list or starts with 606 (Chicago) or 604/605 (suburbs)
  return CHICAGO_AREA_ZIPS.includes(cleanZip) || 
         cleanZip.startsWith('606') || 
         cleanZip.startsWith('604') ||
         cleanZip.startsWith('605') ||
         cleanZip.startsWith('600');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
