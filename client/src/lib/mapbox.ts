// Mapbox GL JS integration
// Note: This requires MAPBOX_ACCESS_TOKEN environment variable

let mapboxgl: any = null;

// Dynamically import Mapbox GL JS
async function loadMapbox() {
  if (typeof window === "undefined") return null;
  
  try {
    const mapbox = await import("mapbox-gl");
    return mapbox.default;
  } catch (error) {
    console.warn("Mapbox GL JS not available, using fallback map");
    return null;
  }
}

export async function initializeMap(container: HTMLElement) {
  mapboxgl = await loadMapbox();
  
  if (!mapboxgl) {
    console.warn("Mapbox not available, showing static background");
    return createFallbackMap(container);
  }

  console.log("All env vars:", import.meta.env);
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  console.log("Raw token value:", accessToken, "Type:", typeof accessToken);
  
  if (!accessToken) {
    console.warn("Mapbox access token not found, using fallback. Token:", accessToken);
    return createFallbackMap(container);
  }

  console.log("Initializing Mapbox with token:", accessToken ? "Token found" : "No token");

  try {
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add drawing controls
    await setupDrawingControls(map);

    return map;
  } catch (error) {
    console.error("Failed to initialize Mapbox:", error);
    return createFallbackMap(container);
  }
}

function createFallbackMap(container: HTMLElement) {
  // Return a simple map-like object for fallback
  return {
    zoomIn: () => console.log("Zoom in"),
    zoomOut: () => console.log("Zoom out"),
    flyTo: (options: any) => console.log("Fly to:", options),
    remove: () => {
      console.log("Map removed");
      // Clear the container content if needed
      if (container) {
        container.innerHTML = '';
      }
    },
    on: () => {},
    off: () => {},
    addLayer: () => {},
    removeLayer: () => {},
    addSource: () => {},
    removeSource: () => {},
    getSource: () => null,
  };
}

async function setupDrawingControls(map: any) {
  try {
    // Try to load Mapbox GL Draw
    const MapboxDraw = await import("@mapbox/mapbox-gl-draw") as any;
    
    const draw = new MapboxDraw.default({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true,
      },
    });

    map.addControl(draw, "top-left");

    map.on("draw.create", (e: any) => {
      console.log("Feature created:", e.features);
    });

    map.on("draw.update", (e: any) => {
      console.log("Feature updated:", e.features);
    });

    map.on("draw.delete", (e: any) => {
      console.log("Feature deleted:", e.features);
    });

    return draw;
  } catch (error) {
    console.warn("Mapbox GL Draw not available:", error);
    return null;
  }
}

export function addDroneLayer(map: any, drones: any[]) {
  if (!map || !mapboxgl) return;

  const geojson = {
    type: "FeatureCollection",
    features: drones.map(drone => ({
      type: "Feature",
      properties: {
        id: drone.id,
        status: drone.status,
        battery: drone.battery,
      },
      geometry: {
        type: "Point",
        coordinates: [drone.longitude, drone.latitude],
      },
    })),
  };

  if (map.getSource("drones")) {
    map.getSource("drones").setData(geojson);
  } else {
    map.addSource("drones", {
      type: "geojson",
      data: geojson,
    });

    map.addLayer({
      id: "drones",
      type: "circle",
      source: "drones",
      paint: {
        "circle-radius": 8,
        "circle-color": [
          "match",
          ["get", "status"],
          "active", "#10b981",
          "mission", "#3b82f6",
          "warning", "#f59e0b",
          "error", "#ef4444",
          "#6b7280"
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
}

export function addMissionLayer(map: any, missions: any[]) {
  if (!map || !mapboxgl) return;

  missions.forEach((mission, index) => {
    if (!mission.waypoints || mission.waypoints.length < 2) return;

    const lineString = {
      type: "Feature",
      properties: { missionId: mission.id },
      geometry: {
        type: "LineString",
        coordinates: mission.waypoints.map((wp: any) => [wp.lng, wp.lat]),
      },
    };

    const sourceId = `mission-${mission.id}`;
    const layerId = `mission-line-${mission.id}`;

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(lineString);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: lineString,
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });
    }
  });
}
