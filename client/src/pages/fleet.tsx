import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppLayout from "@/components/layout/AppLayout";
import type { Drone, InsertDrone } from "@shared/schema";

export default function Fleet() {
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [showAddDrone, setShowAddDrone] = useState(false);
  const [newDrone, setNewDrone] = useState<Partial<InsertDrone>>({
    id: "",
    name: "",
    model: "",
    status: "offline"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drones = [], isLoading } = useQuery({
    queryKey: ["/api/drones"],
    queryFn: async () => {
      const response = await fetch("/api/drones");
      return response.json();
    },
  });

  const addDroneMutation = useMutation({
    mutationFn: async (drone: InsertDrone) => {
      const response = await apiRequest("POST", "/api/drones", drone);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Drone added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/drones"] });
      setShowAddDrone(false);
      setNewDrone({ id: "", name: "", model: "", status: "offline" });
    },
    onError: () => {
      toast({ 
        title: "Failed to add drone", 
        variant: "destructive" 
      });
    },
  });

  const updateDroneMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Drone> }) => {
      const response = await apiRequest("PATCH", `/api/drones/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Drone updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/drones"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "mission": return "bg-blue-500";
      case "warning": return "bg-amber-500";
      case "error": return "bg-red-500";
      case "idle": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "text-emerald-400";
    if (battery > 25) return "text-amber-400";
    return "text-red-400";
  };

  const handleAddDrone = () => {
    if (!newDrone.id || !newDrone.name || !newDrone.model) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    addDroneMutation.mutate(newDrone as InsertDrone);
  };

  const handleStatusChange = (drone: Drone, newStatus: string) => {
    updateDroneMutation.mutate({
      id: drone.id,
      updates: { status: newStatus }
    });
  };

  const handleCalibrateDrone = (drone: Drone) => {
    toast({ 
      title: "Calibration Started", 
      description: `Calibrating ${drone.name}...` 
    });
    
    updateDroneMutation.mutate({
      id: drone.id,
      updates: { 
        status: "calibrating",
        battery: Math.max((drone.battery || 0) - 5, 0) // Simulate battery usage during calibration
      }
    });
    
    // Simulate calibration completion after 3 seconds
    setTimeout(() => {
      updateDroneMutation.mutate({
        id: drone.id,
        updates: { status: "idle" }
      });
      toast({ 
        title: "Calibration Complete", 
        description: `${drone.name} is now calibrated and ready for missions` 
      });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading fleet...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="fleet-title">Fleet Management</h1>
        <Button onClick={() => setShowAddDrone(true)} data-testid="button-add-drone">
          <i className="fas fa-plus mr-2"></i>Add Drone
        </Button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400" data-testid="stats-total">
                {drones.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Drones</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400" data-testid="stats-active">
                {drones.filter((d: Drone) => d.status === "active" || d.status === "mission").length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400" data-testid="stats-warning">
                {drones.filter((d: Drone) => d.status === "warning").length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400" data-testid="stats-offline">
                {drones.filter((d: Drone) => d.status === "offline").length}
              </div>
              <div className="text-sm text-muted-foreground">Offline</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drone List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Drone Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drones.map((drone: Drone) => (
                  <div 
                    key={drone.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-secondary ${
                      selectedDrone?.id === drone.id ? "border-primary bg-secondary" : ""
                    }`}
                    onClick={() => setSelectedDrone(drone)}
                    data-testid={`drone-item-${drone.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold" data-testid={`drone-name-${drone.id}`}>
                          {drone.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{drone.id}</p>
                      </div>
                      <Badge className={getStatusColor(drone.status)} data-testid={`drone-status-${drone.id}`}>
                        {drone.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Model: {drone.model}</div>
                      <div className={getBatteryColor(drone.battery || 0)}>
                        Battery: {Math.round(drone.battery || 0)}%
                      </div>
                      <div>Alt: {drone.altitude || 0}ft</div>
                      <div>Speed: {drone.speed || 0}mph</div>
                    </div>
                  </div>
                ))}
                
                {drones.length === 0 && (
                  <div className="text-center text-muted-foreground py-8" data-testid="no-drones">
                    No drones in fleet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drone Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Drone Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDrone ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid="selected-drone-name">
                      {selectedDrone.name}
                    </h3>
                    <p className="text-muted-foreground">{selectedDrone.id}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedDrone.status)}>
                        {selectedDrone.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span>{selectedDrone.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span className={getBatteryColor(selectedDrone.battery || 0)}>
                        {Math.round(selectedDrone.battery || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-xs">
                        {selectedDrone.latitude?.toFixed(4)}, {selectedDrone.longitude?.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Altitude:</span>
                      <span>{selectedDrone.altitude || 0}ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{selectedDrone.speed || 0}mph</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span>{selectedDrone.signalStrength || 0}dBm</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm"
                        variant={selectedDrone.status === "active" ? "outline" : "default"}
                        onClick={() => handleStatusChange(selectedDrone, selectedDrone.status === "active" ? "idle" : "active")}
                        data-testid="button-toggle-status"
                      >
                        {selectedDrone.status === "active" ? "Idle" : "Activate"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCalibrateDrone(selectedDrone)}
                        disabled={selectedDrone.status === "calibrating"}
                        data-testid="button-calibrate-drone"
                      >
                        {selectedDrone.status === "calibrating" ? "Calibrating..." : "Calibrate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="no-drone-selected">
                  Select a drone to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Drone Dialog */}
      <Dialog open={showAddDrone} onOpenChange={setShowAddDrone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Drone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="drone-id">Drone ID *</Label>
              <Input
                id="drone-id"
                placeholder="DRN-004"
                value={newDrone.id}
                onChange={(e) => setNewDrone(prev => ({ ...prev, id: e.target.value }))}
                data-testid="input-drone-id"
              />
            </div>
            <div>
              <Label htmlFor="drone-name">Name *</Label>
              <Input
                id="drone-name"
                placeholder="Scout Delta"
                value={newDrone.name}
                onChange={(e) => setNewDrone(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-drone-name"
              />
            </div>
            <div>
              <Label htmlFor="drone-model">Model *</Label>
              <Input
                id="drone-model"
                placeholder="DJI Mavic 3"
                value={newDrone.model}
                onChange={(e) => setNewDrone(prev => ({ ...prev, model: e.target.value }))}
                data-testid="input-drone-model"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDrone(false)}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddDrone}
                disabled={addDroneMutation.isPending}
                data-testid="button-save-drone"
              >
                {addDroneMutation.isPending ? "Adding..." : "Add Drone"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}