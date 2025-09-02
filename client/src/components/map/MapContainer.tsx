import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { initializeMap, addDroneLayer, addMissionLayer, addGeofenceLayer } from "@/lib/mapbox";
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

  // Fetch real geofences from API
  const { data: geofences = [] } = useQuery<Geofence[]>({
    queryKey: ["/api/geofences"],
  });

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

  // Update map layers when data changes
  useEffect(() => {
    if (!map.current) return;
    
    addDroneLayer(map.current, drones);
    addMissionLayer(map.current, missions);
    addGeofenceLayer(map.current, geofences);
  }, [drones, missions, geofences]);

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
        center: [77.1025, 28.7041], // Delhi, India
        zoom: 5
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
