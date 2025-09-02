import type { Coordinate } from "@shared/schema";

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: [number, number][][] | [number, number][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export class GeoJSONService {
  /**
   * Convert GeoJSON coordinates to our Coordinate format
   * GeoJSON format: [longitude, latitude]
   * Our format: { lat: latitude, lng: longitude }
   */
  static convertGeoJSONToCoordinates(geojson: GeoJSONFeatureCollection): Coordinate[] {
    const allCoordinates: Coordinate[] = [];
    
    for (const feature of geojson.features) {
      if (feature.geometry.type === "Polygon") {
        // For Polygon, take the first ring (exterior boundary)
        const coordinates = feature.geometry.coordinates[0] as [number, number][];
        for (const coord of coordinates) {
          allCoordinates.push({
            lng: coord[0], // longitude first in GeoJSON
            lat: coord[1]  // latitude second in GeoJSON
          });
        }
      } else if (feature.geometry.type === "MultiPolygon") {
        // For MultiPolygon, take the first polygon's first ring
        const coordinates = feature.geometry.coordinates[0][0] as [number, number][];
        for (const coord of coordinates) {
          allCoordinates.push({
            lng: coord[0],
            lat: coord[1]
          });
        }
      }
    }
    
    return allCoordinates;
  }

  /**
   * Simplify coordinates by taking every nth point to reduce complexity
   */
  static simplifyCoordinates(coordinates: Coordinate[], step: number = 10): Coordinate[] {
    if (coordinates.length <= step) return coordinates;
    
    const simplified: Coordinate[] = [];
    for (let i = 0; i < coordinates.length; i += step) {
      simplified.push(coordinates[i]);
    }
    
    // Always include the last point to close the polygon
    if (simplified[simplified.length - 1] !== coordinates[coordinates.length - 1]) {
      simplified.push(coordinates[coordinates.length - 1]);
    }
    
    return simplified;
  }

  /**
   * Get bounding box of coordinates
   */
  static getBoundingBox(coordinates: Coordinate[]): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    let north = -90, south = 90, east = -180, west = 180;
    
    for (const coord of coordinates) {
      north = Math.max(north, coord.lat);
      south = Math.min(south, coord.lat);
      east = Math.max(east, coord.lng);
      west = Math.min(west, coord.lng);
    }
    
    return { north, south, east, west };
  }
}

// India boundary GeoJSON data - Accurate boundary coordinates
export const INDIA_BOUNDARY_GEOJSON: GeoJSONFeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "fid": 1, "GID_0": "IND", "COUNTRY": "India", "type": "national_boundary" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [68.176645, 23.691965], // Western border
          [68.842599, 24.359134],
          [71.04324, 24.356524],
          [70.844699, 25.215102],
          [70.282873, 25.722229],
          [70.168927, 26.491872],
          [69.514395, 26.940966],
          [70.616496, 27.989196],
          [71.777666, 27.91318],
          [72.823752, 28.961592],
          [73.450638, 29.976019],
          [74.421926, 30.979815],
          [74.405929, 31.692639],
          [75.258642, 32.271105],
          [74.451559, 32.7649],
          [74.104294, 33.441473],
          [73.749948, 34.317699],
          [74.240203, 34.748887],
          [75.757061, 34.504923],
          [76.871722, 34.653544],
          [77.837451, 35.494003],
          [78.912269, 34.321936],
          [78.811086, 33.506198],
          [79.208892, 32.994395],
          [79.176129, 32.48378],
          [78.458446, 32.618164],
          [78.738894, 31.515906],
          [79.721367, 30.882715],
          [81.111256, 30.183481],
          [80.476721, 28.79447],
          [80.088425, 28.79447],
          [81.057203, 28.416095],
          [81.999953, 27.925479],
          [83.304249, 27.364506],
          [84.675018, 27.234901],
          [85.251779, 26.726198],
          [86.024393, 26.630985],
          [87.227472, 26.397898],
          [88.060238, 26.414615],
          [88.174183, 26.810405],
          [88.043133, 27.445819],
          [88.120287, 27.876542],
          [88.730326, 28.086865],
          [88.814346, 27.299316],
          [88.835643, 27.098966],
          [89.744528, 26.719403],
          [90.373275, 26.875724],
          [91.217093, 26.808648],
          [92.033484, 26.83831],
          [92.103712, 27.452614],
          [91.834834, 27.84408],
          [92.503119, 27.896876],
          [93.413348, 28.640629],
          [94.56599, 29.277438],
          [95.404802, 29.031717],
          [96.117679, 29.452802],
          [96.586591, 28.830979],
          [96.248833, 28.411031],
          [97.327114, 28.261583],
          [97.711060, 28.709861],
          [97.402561, 27.88253],
          [97.052856, 27.699059],
          [97.133999, 27.083774],
          [96.419366, 27.264589],
          [95.124768, 26.573572],
          [95.155734, 26.001307],
          [94.603249, 25.162495],
          [94.552658, 24.675238],
          [94.106742, 23.850740],
          [93.325188, 24.078556],
          [93.286327, 23.043658],
          [93.060294, 22.703111],
          [93.166551, 22.27846],
          [92.672721, 22.041239],
          [92.146035, 23.627499],
          [91.869928, 23.624345],
          [91.706475, 22.985264],
          [91.158963, 23.503527],
          [91.46773, 24.072639],
          [91.915093, 24.130414],
          [92.376202, 24.976693],
          [91.799596, 25.147432],
          [90.872211, 25.132601],
          [89.920693, 25.26975],
          [89.832481, 25.965082],
          [89.355094, 26.014407],
          [88.563049, 26.446526],
          [88.209789, 25.768066],
          [88.931554, 25.238692],
          [88.306373, 24.866079],
          [88.084422, 24.501657],
          [88.69994, 24.233715],
          [88.52977, 23.631142],
          [88.876592, 22.879146],
          [89.031961, 22.055708],
          [88.888766, 21.690588],
          [88.208497, 21.703172],
          [86.975704, 21.495562],
          [87.033169, 20.743308],
          [86.499351, 20.151638],
          [85.060266, 19.478579],
          [83.941006, 18.302009],
          [83.189217, 17.671221],
          [82.192757, 17.016636],
          [82.191242, 16.556664],
          [81.692719, 16.310219],
          [80.791999, 15.951972],
          [80.324896, 15.899185],
          [80.025069, 15.136415],
          [80.233274, 13.835771],
          [80.286294, 13.006261],
          [79.862547, 12.056215],
          [79.857999, 10.357275],
          [79.340512, 10.308854],
          [78.885345, 9.546136],
          [79.18972, 9.216544],
          [78.277941, 8.933047],
          [77.941165, 8.252959],
          [77.539898, 7.965535],
          [76.592979, 8.899276],
          [76.130770, 10.29963],
          [75.746467, 11.308251],
          [75.396101, 11.781245],
          [74.864816, 12.741936],
          [74.616717, 13.992583],
          [74.443859, 14.617222],
          [73.534199, 15.990652],
          [73.119909, 17.92857],
          [72.820911, 19.208234],
          [72.824475, 20.419503],
          [72.630533, 21.356009],
          [71.175273, 20.757441],
          [70.470459, 20.877331],
          [69.16413, 22.089298],
          [69.644928, 22.450775],
          [69.349597, 22.84318],
          [68.176645, 23.691965] // Close polygon
        ]]
      }
    }
  ]
};