import {
  calculateDistanceMiles,
  getBrightnessCat,
  asConfidencePct,
  isLikelyFlare,
  getRiskLevel,
} from '../../src/lib/fireUtils';

import type {
  FireLocation,
  ZipCodeLocation,
  NearbyFiresRequest,
  NearbyFiresResponse,
} from '../../src/types/fire.types';

describe('Fire Utility Functions', () => {
  describe('calculateDistanceMiles', () => {
    it('should calculate distance between two points', () => {
      // Los Angeles to San Francisco (~380 miles)
      const la = { lat: 34.0522, lon: -118.2437 };
      const sf = { lat: 37.7749, lon: -122.4194 };

      const distance = calculateDistanceMiles(la.lat, la.lon, sf.lat, sf.lon);

      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(360);
      console.log(`✓ LA to SF: ${distance.toFixed(2)} miles`);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistanceMiles(34.0522, -118.2437, 34.0522, -118.2437);
      expect(distance).toBe(0);
      console.log('✓ Same coordinates: 0 miles');
    });

    it('should calculate short distances accurately', () => {
      // Beverly Hills to Downtown LA (~10 miles)
      const bh = { lat: 34.0901, lon: -118.4065 };
      const dtla = { lat: 34.0522, lon: -118.2437 };

      const distance = calculateDistanceMiles(bh.lat, bh.lon, dtla.lat, dtla.lon);

      expect(distance).toBeGreaterThan(8);
      expect(distance).toBeLessThan(12);
      console.log(`✓ Beverly Hills to Downtown LA: ${distance.toFixed(2)} miles`);
    });

    it('should handle antipodal points (opposite sides of Earth)', () => {
      // North Pole to South Pole
      const distance = calculateDistanceMiles(90, 0, -90, 0);

      expect(distance).toBeGreaterThan(12000);
      expect(distance).toBeCloseTo(12437, -2); // Within ~100 miles
      console.log(`✓ Pole to pole: ${distance.toFixed(2)} miles (Haversine circumference)`);
    });
  });

  describe('getBrightnessCat', () => {
    it('should categorize extreme brightness', () => {
      expect(getBrightnessCat(380)).toBe('Extreme');
      expect(getBrightnessCat(400)).toBe('Extreme');
      console.log('✓ Extreme: 380+');
    });

    it('should categorize severe brightness', () => {
      expect(getBrightnessCat(360)).toBe('Severe');
      expect(getBrightnessCat(370)).toBe('Severe');
      console.log('✓ Severe: 350-374');
    });

    it('should categorize moderate brightness', () => {
      expect(getBrightnessCat(340)).toBe('Moderate');
      expect(getBrightnessCat(349)).toBe('Moderate');
      console.log('✓ Moderate: 325-349');
    });

    it('should categorize small brightness', () => {
      expect(getBrightnessCat(320)).toBe('Small');
      expect(getBrightnessCat(300)).toBe('Small');
      expect(getBrightnessCat(200)).toBe('Small');
      console.log('✓ Small: <325');
    });
  });

  describe('asConfidencePct', () => {
    it('should convert numeric confidence to percentage', () => {
      expect(asConfidencePct(0.75)).toBe(75);
      expect(asConfidencePct(0.5)).toBe(50);
      expect(asConfidencePct(0.99)).toBe(99);
      console.log('✓ Converts 0-1 range: 0.75 → 75%');
    });

    it('should handle numeric strings', () => {
      expect(asConfidencePct('75')).toBe(75);
      expect(asConfidencePct('85')).toBe(85);
      console.log('✓ Handles numeric strings: "75" → 75%');
    });

    it('should handle text confidence levels', () => {
      expect(asConfidencePct('l')).toBe(25);
      expect(asConfidencePct('low')).toBe(25);
      expect(asConfidencePct('n')).toBe(60);
      expect(asConfidencePct('medium')).toBe(60);
      expect(asConfidencePct('h')).toBe(90);
      expect(asConfidencePct('high')).toBe(90);
      console.log('✓ Text confidence: "low"→25%, "medium"→60%, "high"→90%');
    });

    it('should return default for undefined', () => {
      expect(asConfidencePct(undefined)).toBe(60);
      console.log('✓ Undefined → default 60%');
    });

    it('should clamp values to 0-100', () => {
      expect(asConfidencePct(150)).toBe(100);
      expect(asConfidencePct(-50)).toBe(0);
      console.log('✓ Clamps to 0-100 range');
    });
  });

  describe('isLikelyFlare', () => {
    it('should identify likely gas flares', () => {
      const flare = {
        daynight: 'N',
        frp: 20,
        brightness: 320,
        confidence: 50,
      };
      expect(isLikelyFlare(flare)).toBe(true);
      console.log('✓ Identifies: Night + Low FRP + Low brightness + Low confidence = Flare');
    });

    it('should identify real fires', () => {
      const realFire = {
        daynight: 'D',
        frp: 50,
        brightness: 360,
        confidence: 85,
      };
      expect(isLikelyFlare(realFire)).toBe(false);
      console.log('✓ Identifies: Day + High FRP + High brightness + High confidence = Real fire');
    });

    it('should consider daytime detections as real fires', () => {
      const daytimeFire = {
        daynight: 'D',
        frp: 10,
        brightness: 300,
        confidence: 40,
      };
      expect(isLikelyFlare(daytimeFire)).toBe(false);
      console.log('✓ Daytime detection → Real fire (even if low FRP)');
    });

    it('should consider high confidence as real fires', () => {
      const highConfidence = {
        daynight: 'N',
        frp: 20,
        brightness: 320,
        confidence: 85,
      };
      expect(isLikelyFlare(highConfidence)).toBe(false);
      console.log('✓ High confidence (85%) → Real fire');
    });
  });

  describe('getRiskLevel', () => {
    it('should return Low risk with no fires', () => {
      expect(getRiskLevel(0, 0)).toBe('Low');
      console.log('✓ 0 fires → Low risk');
    });

    it('should return Moderate risk with few low-brightness fires', () => {
      expect(getRiskLevel(2, 330)).toBe('Moderate');
      console.log('✓ 2 fires, avg brightness 330 → Moderate risk');
    });

    it('should return High risk with multiple moderate fires', () => {
      expect(getRiskLevel(5, 350)).toBe('High');
      console.log('✓ 5 fires, avg brightness 350 → High risk');
    });

    it('should return Critical risk with many bright fires', () => {
      expect(getRiskLevel(10, 370)).toBe('Critical');
      console.log('✓ 10 fires, avg brightness 370 → Critical risk');
    });

    it('should return Critical for extreme fires', () => {
      expect(getRiskLevel(3, 380)).toBe('Critical');
      console.log('✓ 3 extreme fires (brightness 380) → Critical risk');
    });
  });
});

describe('Fire Types', () => {
  it('should validate FireLocation interface', () => {
    const fire: FireLocation = {
      latitude: 34.0522,
      longitude: -118.2437,
      brightness: 350,
      confidence: 85,
      satellite: 'NOAA-21',
      instrument: 'VIIRS',
      frp: 45.5,
      daynight: 'D',
      brightnessCat: 'Severe',
      predictable: true,
      timestamp: new Date(),
      distanceFromCenter: 12.5,
    };

    expect(fire.latitude).toBeCloseTo(34.0522, 3);
    expect(fire.brightness).toBeGreaterThan(300);
    expect(fire.confidence).toBeGreaterThan(50);
    console.log('✓ FireLocation interface validated');
  });

  it('should validate ZipCodeLocation interface', () => {
    const location: ZipCodeLocation = {
      zipCode: '90210',
      latitude: 34.0901,
      longitude: -118.4065,
      city: 'Beverly Hills',
      state: 'California',
      country: 'US',
    };

    expect(location.zipCode).toBe('90210');
    expect(location.city).toBe('Beverly Hills');
    expect(location.latitude).toBeCloseTo(34.09, 1);
    console.log('✓ ZipCodeLocation interface validated');
  });

  it('should validate NearbyFiresRequest interface', () => {
    const request: NearbyFiresRequest = {
      zipCode: '90210',
      radiusMiles: 100,
      excludeFlares: true,
      predictableOnly: false,
    };

    expect(request.zipCode).toBe('90210');
    expect(request.radiusMiles).toBe(100);
    expect(request.excludeFlares).toBe(true);
    console.log('✓ NearbyFiresRequest interface validated');
  });

  it('should validate NearbyFiresResponse interface', () => {
    const response: NearbyFiresResponse = {
      success: true,
      message: 'Found 3 fires',
      location: {
        zipCode: '90210',
        latitude: 34.0901,
        longitude: -118.4065,
        city: 'Beverly Hills',
        state: 'California',
      },
      radiusMiles: 100,
      firesCount: 3,
      fires: [],
      educationalContent: {
        fireCategory: 'Wildfire Safety',
        safetyTips: ['Evacuate immediately'],
        riskLevel: 'High',
        resources: [
          {
            title: 'FEMA',
            url: 'https://www.fema.gov',
            description: 'Emergency management',
          },
        ],
      },
    };

    expect(response.success).toBe(true);
    expect(response.firesCount).toBe(3);
    expect(response.educationalContent?.riskLevel).toBe('High');
    console.log('✓ NearbyFiresResponse interface validated');
  });
});

describe('Integration: Fire Utility Functions Working Together', () => {
  it('should process fire data from CSV', () => {
    // Simulate parsed fire data
    const fireData = {
      latitude: 34.0522,
      longitude: -118.2437,
      brightness: 360,
      confidence: '85',
      satellite: 'NOAA-21',
      instrument: 'VIIRS',
      frp: 50,
      daynight: 'D' as const,
    };

    // Process through utility functions
    const brightnessCat = getBrightnessCat(fireData.brightness);
    const confidencePct = asConfidencePct(fireData.confidence);
    const isFlare = isLikelyFlare({
      daynight: fireData.daynight,
      frp: fireData.frp,
      brightness: fireData.brightness,
      confidence: confidencePct,
    });

    // Verify results
    expect(brightnessCat).toBe('Severe');
    expect(confidencePct).toBe(85);
    expect(isFlare).toBe(false);

    console.log('✓ Fire processing pipeline:');
    console.log(`  - Brightness: ${fireData.brightness} → ${brightnessCat}`);
    console.log(`  - Confidence: ${fireData.confidence} → ${confidencePct}%`);
    console.log(`  - Is Flare: ${isFlare}`);
  });

  it('should calculate risk level for fire cluster', () => {
    // Simulate 3 fires detected
    const fires = [
      { brightness: 340 },
      { brightness: 350 },
      { brightness: 360 },
    ];

    const avgBrightness =
      fires.reduce((sum, f) => sum + f.brightness, 0) / fires.length;
    const riskLevel = getRiskLevel(fires.length, avgBrightness);

    expect(avgBrightness).toBeCloseTo(350, 0);
    expect(riskLevel).toBe('High');

    console.log('✓ Risk assessment for 3-fire cluster:');
    console.log(`  - Average brightness: ${avgBrightness.toFixed(0)}`);
    console.log(`  - Risk level: ${riskLevel}`);
  });

  it('should distance-sort fires from center point', () => {
    const centerLat = 34.0522;
    const centerLon = -118.2437;

    // Create mock fires with distances
    const fires: Partial<FireLocation>[] = [
      {
        latitude: 34.1,
        longitude: -118.3,
        distanceFromCenter: calculateDistanceMiles(
          centerLat,
          centerLon,
          34.1,
          -118.3
        ),
      },
      {
        latitude: 34.05,
        longitude: -118.24,
        distanceFromCenter: calculateDistanceMiles(
          centerLat,
          centerLon,
          34.05,
          -118.24
        ),
      },
      {
        latitude: 34.2,
        longitude: -118.4,
        distanceFromCenter: calculateDistanceMiles(
          centerLat,
          centerLon,
          34.2,
          -118.4
        ),
      },
    ];

    // Sort by distance
    const sorted = [...fires].sort(
      (a, b) => (a.distanceFromCenter || 0) - (b.distanceFromCenter || 0)
    );

    // Verify sorting
    for (let i = 1; i < sorted.length; i++) {
      expect((sorted[i].distanceFromCenter || 0)).toBeGreaterThanOrEqual(
        sorted[i - 1].distanceFromCenter || 0
      );
    }

    console.log('✓ Fires sorted by distance from center:');
    sorted.forEach((f, i) => {
      console.log(`  ${i + 1}. Distance: ${f.distanceFromCenter?.toFixed(2)} mi`);
    });
  });
});