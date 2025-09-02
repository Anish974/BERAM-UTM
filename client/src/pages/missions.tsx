import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";
import type { Mission } from "@shared/schema";

export default function Missions() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["/api/missions"],
    queryFn: async () => {
      const response = await fetch("/api/missions");
      return response.json();
    },
  });

  const deleteMissionMutation = useMutation({
    mutationFn: async (missionId: string) => {
      await apiRequest("DELETE", `/api/missions/${missionId}`);
    },
    onSuccess: () => {
      toast({ title: "Mission deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      setSelectedMission(null);
    },
    onError: () => {
      toast({ 
        title: "Failed to delete mission", 
        variant: "destructive" 
      });
    },
  });

  const updateMissionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mission> }) => {
      const response = await apiRequest("PATCH", `/api/missions/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Mission updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500";
      case "planned": return "bg-emerald-500";
      case "paused": return "bg-amber-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleStatusChange = (mission: Mission, newStatus: string) => {
    updateMissionMutation.mutate({
      id: mission.id,
      updates: { status: newStatus }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading missions...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="missions-title">Mission Management</h1>
        <Button data-testid="button-new-mission">
          <i className="fas fa-plus mr-2"></i>New Mission
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Missions ({missions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missions.map((mission: Mission) => (
                  <div 
                    key={mission.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-secondary ${
                      selectedMission?.id === mission.id ? "border-primary bg-secondary" : ""
                    }`}
                    onClick={() => setSelectedMission(mission)}
                    data-testid={`mission-item-${mission.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold" data-testid={`mission-name-${mission.id}`}>
                        {mission.name}
                      </h3>
                      <Badge className={getStatusColor(mission.status)} data-testid={`mission-status-${mission.id}`}>
                        {mission.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Type: {mission.type}</p>
                      <p>Drone: {mission.droneId || "Unassigned"}</p>
                      <p>Altitude: {mission.altitude}ft</p>
                      {mission.progress !== undefined && (
                        <p>Progress: {Math.round(mission.progress)}%</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {missions.length === 0 && (
                  <div className="text-center text-muted-foreground py-8" data-testid="no-missions">
                    No missions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Mission Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMission ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid="selected-mission-name">
                      {selectedMission.name}
                    </h3>
                    <p className="text-muted-foreground" data-testid="selected-mission-description">
                      {selectedMission.description || "No description"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedMission.status)}>
                        {selectedMission.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{selectedMission.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drone:</span>
                      <span>{selectedMission.droneId || "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Altitude:</span>
                      <span>{selectedMission.altitude}ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{selectedMission.speed || "Default"}mph</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMission.status === "planned" && (
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(selectedMission, "active")}
                          data-testid="button-start-mission"
                        >
                          Start
                        </Button>
                      )}
                      {selectedMission.status === "active" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(selectedMission, "paused")}
                          data-testid="button-pause-mission"
                        >
                          Pause
                        </Button>
                      )}
                      {selectedMission.status === "paused" && (
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(selectedMission, "active")}
                          data-testid="button-resume-mission"
                        >
                          Resume
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteMissionMutation.mutate(selectedMission.id)}
                        disabled={deleteMissionMutation.isPending}
                        data-testid="button-delete-mission"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="no-mission-selected">
                  Select a mission to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}