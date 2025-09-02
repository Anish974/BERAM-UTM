import type { Drone } from "@shared/schema";

interface DroneMarkerProps {
  drone: Drone;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-500";
    case "mission": return "bg-blue-500";
    case "warning": return "bg-amber-500";
    case "error": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getStatusPosition = (droneId: string) => {
  // Simple positioning logic for demo
  const positions: Record<string, { top: string; left: string }> = {
    "DRN-001": { top: "35%", left: "45%" },
    "DRN-002": { top: "55%", left: "60%" },
    "DRN-003": { top: "40%", left: "70%" },
  };
  return positions[droneId] || { top: "50%", left: "50%" };
};

export default function DroneMarker({ drone }: DroneMarkerProps) {
  const position = getStatusPosition(drone.id);
  const statusColor = getStatusColor(drone.status);

  return (
    <div 
      className="absolute"
      style={position}
      data-testid={`drone-marker-${drone.id}`}
    >
      <div className="relative">
        <div className={`w-4 h-4 ${statusColor} rounded-full border-2 border-background animate-pulse`}></div>
        <div className="absolute -top-8 -left-8 bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
          <span className="font-medium" data-testid={`drone-id-${drone.id}`}>{drone.id}</span>
          <span className="text-muted-foreground ml-1" data-testid={`drone-altitude-${drone.id}`}>
            {drone.altitude}ft
          </span>
        </div>
      </div>
    </div>
  );
}
