export interface MapboxMap {
  zoomIn(): void;
  zoomOut(): void;
  flyTo(options: { center: [number, number]; zoom: number }): void;
  remove(): void;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  addLayer(layer: any): void;
  removeLayer(id: string): void;
  addSource(id: string, source: any): void;
  removeSource(id: string): void;
  getSource(id: string): any;
}

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface AirspaceConflict {
  geofenceId: string;
  geofenceName: string;
  type: string;
  waypoint: {
    lat: number;
    lng: number;
  };
}

export interface AirspaceCheckResult {
  hasConflicts: boolean;
  conflicts: AirspaceConflict[];
}
