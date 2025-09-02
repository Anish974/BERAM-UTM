import type { Mission, Waypoint } from "@shared/schema";

interface MissionPathProps {
  mission: Mission;
}

export default function MissionPath({ mission }: MissionPathProps) {
  if (!mission.waypoints || mission.status === "completed" || mission.status === "cancelled") {
    return null;
  }

  const waypoints = mission.waypoints as Waypoint[];
  
  // Simple path visualization for demo
  // In a real implementation, this would use Mapbox GL JS layers
  return (
    <div data-testid={`mission-path-${mission.id}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {waypoints.length > 1 && (
          <path 
            d={`M 45% 35% L 50% 30% L 55% 35% L 60% 40%`}
            stroke="rgb(59 130 246)" 
            strokeWidth="2" 
            fill="none" 
            className="mission-path opacity-80"
          />
        )}
        
        {waypoints.map((waypoint, index) => {
          // Simple positioning for demo
          const positions = [
            { cx: "45%", cy: "35%" },
            { cx: "50%", cy: "30%" },
            { cx: "55%", cy: "35%" },
            { cx: "60%", cy: "40%" },
          ];
          const pos = positions[index] || { cx: "50%", cy: "50%" };
          
          return (
            <circle 
              key={index}
              cx={pos.cx} 
              cy={pos.cy} 
              r="3" 
              fill="rgb(59 130 246)" 
              className="animate-pulse"
              data-testid={`waypoint-${mission.id}-${index}`}
            />
          );
        })}
      </svg>
    </div>
  );
}
