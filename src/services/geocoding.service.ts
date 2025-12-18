import axios from 'axios';
import logger from '../lib/logger';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export async function zipCodeToCoordinates(
  zipCode: string,
  country: string = 'US'
): Promise<GeocodingResult> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY not configured');
    }

    const cleanZip = zipCode.trim().toUpperCase();
    if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) {
      throw new Error(`Invalid ZIP code format: ${zipCode}`);
    }

    const url = `https://api.openweathermap.org/geo/1.0/zip`;
    const response = await axios.get(url, {
      params: {
        zip: `${cleanZip},${country}`,
        appid: apiKey,
      },
      timeout: 10000,
    });

    const { lat, lon, name, state } = response.data;

    if (!lat || !lon) {
      throw new Error(`ZIP code not found: ${zipCode}`);
    }

    logger.log(`✓ Geocoded ZIP ${cleanZip}: ${lat}, ${lon}`);

    return {
      latitude: lat,
      longitude: lon,
      city: name,
      state: state,
      country: country,
    };
  } catch (err: any) {
    logger.error(`Geocoding error for ZIP ${zipCode}:`, err.message);
    throw err;
  }
}