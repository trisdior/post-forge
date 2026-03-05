export type ProjectType = 
  | 'kitchen' 
  | 'bathroom' 
  | 'flooring' 
  | 'painting' 
  | 'full-remodel' 
  | 'other';

export type RoomSize = 'small' | 'medium' | 'large';

export type QualityLevel = 'budget' | 'mid-range' | 'premium';

export type Timeline = 'asap' | '1-3-months' | '3-6-months' | 'flexible';

export interface KitchenOptions {
  cabinets: boolean;
  countertops: boolean;
  backsplash: boolean;
  appliances: boolean;
  plumbing: boolean;
  electrical: boolean;
}

export interface BathroomOptions {
  tubShower: boolean;
  vanity: boolean;
  tile: boolean;
  fixtures: boolean;
  plumbing: boolean;
}

export interface FlooringOptions {
  materialType: 'hardwood' | 'tile' | 'lvp' | 'carpet';
  roomCount: number;
  sqft: number;
}

export interface PaintingOptions {
  type: 'interior' | 'exterior' | 'both';
  roomCount: number;
  prepWork: 'minimal' | 'moderate' | 'extensive';
}

export interface ProjectOptions {
  kitchen?: KitchenOptions;
  bathroom?: BathroomOptions;
  flooring?: FlooringOptions;
  painting?: PaintingOptions;
}

export interface CalculatorState {
  step: number;
  projectType: ProjectType | null;
  roomSize: RoomSize | null;
  qualityLevel: QualityLevel | null;
  projectOptions: ProjectOptions;
  timeline: Timeline | null;
  zipCode: string;
}

export interface CostEstimate {
  low: number;
  mid: number;
  high: number;
  breakdown: {
    materials: { low: number; mid: number; high: number };
    labor: { low: number; mid: number; high: number };
    permits: { low: number; mid: number; high: number };
    contingency: { low: number; mid: number; high: number };
  };
  timelineWeeks: { min: number; max: number };
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: ProjectType | null;
  roomSize: RoomSize | null;
  qualityLevel: QualityLevel | null;
  estimate: CostEstimate;
  zipCode: string;
  timeline: Timeline | null;
  createdAt: string;
}
