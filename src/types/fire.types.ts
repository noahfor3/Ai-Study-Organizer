export interface FireLocation {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: number;
  satellite: string;
  instrument: string;
  frp: number;
  daynight: 'D' | 'N';
  brightnessCat: 'Small' | 'Moderate' | 'Severe' | 'Extreme';
  predictable: boolean;
  timestamp: Date;
  distanceFromCenter?: number;
}

export interface ZipCodeLocation {
  zipCode: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface NearbyFiresRequest {
  zipCode: string;
  radiusMiles: number; // 50, 100, 150 for now
  excludeFlares?: boolean;
  predictableOnly?: boolean;
}

export interface NearbyFiresResponse {
  success: boolean;
  message: string;
  location: ZipCodeLocation;
  radiusMiles: number;
  firesCount: number;
  fires: FireLocation[];
  educationalContent?: EducationalContent;
}

export interface EducationalContent {
  fireCategory: string;
  safetyTips: string[];
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  resources: ResourceLink[];
}

export interface ResourceLink {
  title: string;
  url: string;
  description: string;
}