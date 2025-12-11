export type FirePoint = {
  latitude: number;
  longitude: number;
  brightness?: number;
  frp?: number;
  confidence?: number | string;
  distanceFromCenter?: number;
  timestamp?: string | Date;
  brightnessCat?: string;
};
