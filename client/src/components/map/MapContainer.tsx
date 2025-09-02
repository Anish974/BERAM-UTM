import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { initializeMap, addDroneLayer, addMissionLayer, addGeofenceLayer, changeMapStyle, MAP_STYLES } from "@/lib/mapbox";
import MapLegend from "./MapLegend";
import MapStyleSelector from "./MapStyleSelector";
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
  const [currentMapStyle, setCurrentMapStyle] = useState(MAP_STYLES.satellite);
  const [visibleLayers, setVisibleLayers] = useState({
    drones: true,
    missions: true,
    geofences: true,
    noFlyZones: true,
    restrictedZones: true,
  });

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
    
    if (visibleLayers.drones) {
      addDroneLayer(map.current, drones);
    }
    if (visibleLayers.missions) {
      addMissionLayer(map.current, missions);
    }
    if (visibleLayers.geofences || visibleLayers.restrictedZones || visibleLayers.noFlyZones) {
      const filteredGeofences = geofences.filter(geofence => {
        if (geofence.type === "no_fly" && !visibleLayers.noFlyZones) return false;
        if (geofence.type === "restricted" && !visibleLayers.restrictedZones) return false;
        if (geofence.type !== "no_fly" && geofence.type !== "restricted" && !visibleLayers.geofences) return false;
        return true;
      });
      addGeofenceLayer(map.current, filteredGeofences);
    }
  }, [drones, missions, geofences, visibleLayers]);

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

  const handleStyleChange = (style: string) => {
    setCurrentMapStyle(style);
    changeMapStyle(map.current, style);
  };

  const handleToggleLayer = (layerType: string, visible: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layerType]: visible }));
  };

  // Calculate layer counts for legend
  const layerCounts = {
    drones: drones.length,
    missions: missions.length,
    geofences: geofences.filter(g => g.type !== "no_fly" && g.type !== "restricted").length,
    noFlyZones: geofences.filter(g => g.type === "no_fly").length,
    restrictedZones: geofences.filter(g => g.type === "restricted").length,
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
        <MapStyleSelector 
          onStyleChange={handleStyleChange}
          currentStyle={currentMapStyle}
        />
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

      {/* Map Legend */}
      <div className="absolute top-4 left-4">
        <MapLegend 
          onToggleLayer={handleToggleLayer}
          layerCounts={layerCounts}
        />
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
