export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getBrightnessCat(brightness: number): string {
  if (brightness >= 375) return 'Extreme';
  if (brightness >= 350) return 'Severe';
  if (brightness >= 325) return 'Moderate';
  return 'Small';
}

export function asConfidencePct(conf: string | number | undefined): number {
  const s = String(conf ?? '').trim().toLowerCase();
  if (!s) return 60; // neutral default

  const n = Number(s);
  if (!Number.isNaN(n)) {
    if (n >= 0 && n <= 1) return Math.round(n * 100);
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  if (s === 'l' || s === 'low') return 25;
  if (s === 'n' || s === 'nominal' || s === 'med' || s === 'medium') return 60;
  if (s === 'h' || s === 'high') return 90;

  return 60;
}

export function isLikelyFlare(fire: {
  daynight: string;
  frp: number;
  brightness: number;
  confidence: number;
}): boolean {
  return (
    fire.daynight === 'N' &&
    fire.confidence <= 60 &&
    fire.frp < 25 &&
    fire.brightness < 330
  );
}

export function getRiskLevel(
  firesCount: number,
  avgBrightness: number
): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (firesCount === 0) return 'Low';
  if (firesCount <= 2 && avgBrightness < 340) return 'Moderate';
  if (firesCount <= 5 && avgBrightness < 360) return 'High';
  return 'Critical';
}