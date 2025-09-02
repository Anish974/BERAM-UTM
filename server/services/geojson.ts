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

// India boundary GeoJSON data
export const INDIA_BOUNDARY_GEOJSON: GeoJSONFeatureCollection = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "fid": 1, "GID_0": "IND", "COUNTRY": "India" },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[
          [68.246865971990275, 23.583159052052334],
          [68.246736037464302, 23.585676468100537],
          [68.246467518708073, 23.597259082944756],
          [68.246857123063904, 23.608838805802463],
          [68.247903966691055, 23.620383920570486],
          [68.248694873996129, 23.625719768821948],
          [68.248606503327778, 23.628071207330684],
          [97.415292, 37.084107],
          [97.415292, 6.755953],
          [68.135315, 6.755953],
          [68.135315, 37.084107],
          [68.246865971990275, 23.583159052052334]
        ]]]]
      }
    }
  ]
};