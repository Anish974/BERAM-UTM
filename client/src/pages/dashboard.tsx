import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MapContainer from "@/components/map/MapContainer";
import TelemetryFeed from "@/components/telemetry/TelemetryFeed";
import ActiveMissions from "@/components/missions/ActiveMissions";
import MissionPlannerModal from "@/components/missions/MissionPlannerModal";
import AlertPanel from "@/components/alerts/AlertPanel";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const [missionPlannerOpen, setMissionPlannerOpen] = useState(false);
  const { isConnected, drones, telemetry, missions, alerts } = useWebSocket();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar 
          isConnected={isConnected}
          activeDroneCount={drones.filter(d => d.status === "active" || d.status === "mission").length}
          onNewMission={() => setMissionPlannerOpen(true)}
        />
        
        <div className="flex-1 flex relative">
          <MapContainer drones={drones} missions={missions} />
          
          <div className="w-80 bg-card border-l border-border flex flex-col">
            <TelemetryFeed drones={drones} telemetry={telemetry} />
            <ActiveMissions missions={missions} />
          </div>
          
          <AlertPanel alerts={alerts} />
        </div>
      </div>
      
      {missionPlannerOpen && (
        <MissionPlannerModal 
          open={missionPlannerOpen}
          onClose={() => setMissionPlannerOpen(false)}
          availableDrones={drones.filter(d => d.status === "idle" || d.status === "active")}
        />
      )}
    </div>
  );
}
