import type { Geofence } from "@shared/schema";

interface GeofenceZoneProps {
  geofence: Geofence;
}

const getGeofenceStyle = (type: string) => {
  switch (type) {
    case "no_fly":
      return {
        border: "border-red-500",
        bg: "bg-red-500/10",
        text: "text-red-400"
      };
    case "restricted":
      return {
        border: "border-amber-500",
        bg: "bg-amber-500/10",
        text: "text-amber-400"
      };
    case "warning":
      return {
        border: "border-yellow-500",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400"
      };
    default:
      return {
        border: "border-gray-500",
        bg: "bg-gray-500/10",
        text: "text-gray-400"
      };
  }
};

const getGeofencePosition = (geofenceId: string) => {
  // Simple positioning for demo
  const positions: Record<string, { top: string; left: string; width: string; height: string }> = {
    "geo-1": { top: "20%", left: "30%", width: "20%", height: "15%" },
    "geo-2": { top: "65%", left: "25%", width: "25%", height: "20%" },
  };
  return positions[geofenceId] || { top: "50%", left: "50%", width: "20%", height: "15%" };
};

export default function GeofenceZone({ geofence }: GeofenceZoneProps) {
  if (!geofence.active) return null;
  
  const style = getGeofenceStyle(geofence.type);
  const position = getGeofencePosition(geofence.id);

  return (
    <div 
      className={`absolute border-2 border-dashed rounded-lg ${style.border} ${style.bg}`}
      style={position}
      data-testid={`geofence-${geofence.id}`}
    >
      <div className={`absolute -top-6 left-2 text-xs font-medium ${style.text}`}>
        {geofence.name.toUpperCase()}
      </div>
    </div>
  );
}
