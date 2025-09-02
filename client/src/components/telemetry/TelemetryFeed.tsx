import type { Drone, Telemetry } from "@shared/schema";

interface TelemetryFeedProps {
  drones: Drone[];
  telemetry: Record<string, Telemetry[]>;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "active":
      return { color: "bg-emerald-500", label: "ACTIVE" };
    case "mission":
      return { color: "bg-blue-500", label: "MISSION" };
    case "warning":
      return { color: "bg-amber-500", label: "WARNING" };
    case "error":
      return { color: "bg-red-500", label: "ERROR" };
    case "idle":
      return { color: "bg-gray-500", label: "IDLE" };
    default:
      return { color: "bg-gray-500", label: "OFFLINE" };
  }
};

const getBatteryColor = (battery: number) => {
  if (battery > 50) return "text-emerald-400";
  if (battery > 25) return "text-amber-400";
  return "text-red-400";
};

export default function TelemetryFeed({ drones, telemetry }: TelemetryFeedProps) {
  return (
    <div className="border-b border-border">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3" data-testid="telemetry-title">Live Telemetry</h3>
        
        <div className="space-y-3">
          {drones.map((drone) => {
            const statusInfo = getStatusInfo(drone.status);
            const batteryColor = getBatteryColor(drone.battery || 0);
            
            return (
              <div 
                key={drone.id}
                className={`p-3 bg-secondary rounded-lg ${
                  drone.status === "warning" ? "border border-amber-500/30" : ""
                }`}
                data-testid={`telemetry-card-${drone.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm" data-testid={`drone-name-${drone.id}`}>
                    {drone.id}
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 ${statusInfo.color} rounded-full status-indicator`}></div>
                    <span 
                      className={`text-xs ${
                        drone.status === "warning" ? "text-amber-400" : "text-muted-foreground"
                      }`}
                      data-testid={`drone-status-${drone.id}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Alt:</span>
                    <span className="ml-1 font-mono" data-testid={`drone-altitude-${drone.id}`}>
                      {drone.altitude || 0}ft
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="ml-1 font-mono" data-testid={`drone-speed-${drone.id}`}>
                      {drone.speed || 0}mph
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Battery:</span>
                    <span className={`ml-1 font-mono ${batteryColor}`} data-testid={`drone-battery-${drone.id}`}>
                      {Math.round(drone.battery || 0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signal:</span>
                    <span className="ml-1 font-mono text-emerald-400" data-testid={`drone-signal-${drone.id}`}>
                      {drone.signalStrength || 0}dBm
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {drones.length === 0 && (
            <div className="text-center text-muted-foreground py-8" data-testid="no-drones-message">
              No drones connected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
