import { useEffect, useRef, useState } from "react";
import { initializeMap } from "@/lib/mapbox";
import DroneMarker from "./DroneMarker";
import MissionPath from "./MissionPath";
import GeofenceZone from "./GeofenceZone";
import type { Drone, Mission, Geofence } from "@shared/schema";

interface MapContainerProps {
  drones: Drone[];
  missions: Mission[];
}

export default function MapContainer({ drones, missions }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'waypoints' | 'geofence' | null>(null);

  // Mock geofences for display
  const geofences: Geofence[] = [
    {
      id: "geo-1",
      name: "No-Fly Zone",
      type: "no_fly",
      coordinates: [
        { lat: 37.7849, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4194 },
        { lat: 37.7849, lng: -122.4194 }
      ],
      minAltitude: 0,
      maxAltitude: 400,
      active: true,
      createdAt: new Date(),
    },
    {
      id: "geo-2",
      name: "Restricted Airspace",
      type: "restricted",
      coordinates: [
        { lat: 37.7549, lng: -122.4494 },
        { lat: 37.7649, lng: -122.4494 },
        { lat: 37.7649, lng: -122.4294 },
        { lat: 37.7549, lng: -122.4294 }
      ],
      minAltitude: 0,
      maxAltitude: 200,
      active: true,
      createdAt: new Date(),
    }
  ];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    initializeMap(mapContainer.current).then((mapInstance) => {
      map.current = mapInstance;
    });
    
    return () => {
      if (map.current && typeof map.current.remove === 'function') {
        map.current.remove();
      }
    };
  }, []);

  const handleDrawWaypoints = () => {
    setDrawMode('waypoints');
    setIsDrawing(true);
    // Enable drawing mode on map
    console.log("Enable waypoint drawing");
  };

  const handleDrawGeofence = () => {
    setDrawMode('geofence');
    setIsDrawing(true);
    // Enable polygon drawing mode on map
    console.log("Enable geofence drawing");
  };

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-122.4194, 37.7749],
        zoom: 12
      });
    }
  };

  return (
    <div className="flex-1 relative">
      <div 
        ref={mapContainer}
        className="w-full h-full map-container relative"
        data-testid="map-container"
      >
        {/* Fallback background for when Mapbox is not available */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        
        {/* Drone markers overlay */}
        <div className="absolute inset-0">
          {drones.map((drone) => (
            <DroneMarker key={drone.id} drone={drone} />
          ))}
        </div>

        {/* Mission paths overlay */}
        <div className="absolute inset-0">
          {missions.map((mission) => (
            <MissionPath key={mission.id} mission={mission} />
          ))}
        </div>

        {/* Geofence zones overlay */}
        <div className="absolute inset-0">
          {geofences.map((geofence) => (
            <GeofenceZone key={geofence.id} geofence={geofence} />
          ))}
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button 
          className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <i className="fas fa-plus text-sm"></i>
        </button>
        <button 
          className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <i className="fas fa-minus text-sm"></i>
        </button>
        <button 
          className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
          onClick={handleRecenter}
          data-testid="button-recenter"
        >
          <i className="fas fa-crosshairs text-sm"></i>
        </button>
      </div>
      
      {/* Drawing Tools */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <button 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            drawMode === 'waypoints' && isDrawing
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
          onClick={handleDrawWaypoints}
          data-testid="button-draw-waypoints"
        >
          <i className="fas fa-pencil-alt mr-2"></i>Draw Waypoints
        </button>
        <button 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            drawMode === 'geofence' && isDrawing
              ? "bg-card border border-primary text-primary"
              : "bg-card border border-border text-foreground hover:bg-secondary"
          }`}
          onClick={handleDrawGeofence}
          data-testid="button-draw-geofence"
        >
          <i className="fas fa-draw-polygon mr-2"></i>Draw Geofence
        </button>
      </div>
    </div>
  );
}
