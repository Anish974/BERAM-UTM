import type { Mission } from "@shared/schema";

interface ActiveMissionsProps {
  missions: Mission[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "border-blue-500";
    case "planned":
      return "border-emerald-500";
    case "paused":
      return "border-amber-500";
    case "completed":
      return "border-gray-500";
    default:
      return "border-gray-500";
  }
};

const getStatusButton = (status: string) => {
  switch (status) {
    case "active":
      return { text: "Pause", class: "bg-amber-600 text-white", action: "pause" };
    case "planned":
      return { text: "Start", class: "bg-emerald-600 text-white", action: "start" };
    case "paused":
      return { text: "Resume", class: "bg-blue-600 text-white", action: "resume" };
    default:
      return { text: "View", class: "bg-primary text-primary-foreground", action: "view" };
  }
};

export default function ActiveMissions({ missions }: ActiveMissionsProps) {
  const activeMissions = missions.filter(m => 
    m.status === "active" || m.status === "planned" || m.status === "paused"
  );

  const handleMissionAction = (missionId: string, action: string) => {
    console.log(`${action} mission:`, missionId);
    // TODO: Implement mission actions
  };

  const handleViewMission = (missionId: string) => {
    console.log("View mission:", missionId);
    // TODO: Implement mission view
  };

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" data-testid="active-missions-title">Active Missions</h3>
        <button 
          className="text-xs text-primary hover:text-primary/80"
          data-testid="button-view-all-missions"
        >
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {activeMissions.map((mission) => {
          const statusColor = getStatusColor(mission.status);
          const statusButton = getStatusButton(mission.status);
          
          return (
            <div 
              key={mission.id}
              className={`p-3 bg-secondary rounded-lg border-l-4 ${statusColor}`}
              data-testid={`mission-card-${mission.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm" data-testid={`mission-name-${mission.id}`}>
                  {mission.name}
                </span>
                <span className="text-xs text-muted-foreground" data-testid={`mission-status-${mission.id}`}>
                  {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                <span data-testid={`mission-drone-${mission.id}`}>Drone: {mission.droneId}</span>
                {mission.status === "active" && (
                  <>
                    {" • "}
                    <span data-testid={`mission-progress-${mission.id}`}>
                      Progress: {Math.round(mission.progress || 0)}%
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                  onClick={() => handleViewMission(mission.id)}
                  data-testid={`button-view-mission-${mission.id}`}
                >
                  View
                </button>
                <button 
                  className={`px-2 py-1 rounded text-xs ${statusButton.class}`}
                  onClick={() => handleMissionAction(mission.id, statusButton.action)}
                  data-testid={`button-${statusButton.action}-mission-${mission.id}`}
                >
                  {statusButton.text}
                </button>
              </div>
            </div>
          );
        })}
        
        {activeMissions.length === 0 && (
          <div className="text-center text-muted-foreground py-8" data-testid="no-missions-message">
            No active missions
          </div>
        )}
      </div>
      
      {/* Mission Stats */}
      <div className="mt-6 p-3 bg-muted rounded-lg">
        <h4 className="font-medium text-sm mb-2" data-testid="stats-title">Today's Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400" data-testid="stats-completed">
              {missions.filter(m => m.status === "completed").length}
            </div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400" data-testid="stats-active">
              {missions.filter(m => m.status === "active").length}
            </div>
            <div className="text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400" data-testid="stats-planned">
              {missions.filter(m => m.status === "planned").length}
            </div>
            <div className="text-muted-foreground">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground" data-testid="stats-flight-time">4.2h</div>
            <div className="text-muted-foreground">Flight Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
