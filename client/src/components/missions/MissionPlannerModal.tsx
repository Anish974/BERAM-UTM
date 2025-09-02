import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Drone, Waypoint } from "@shared/schema";

interface MissionPlannerModalProps {
  open: boolean;
  onClose: () => void;
  availableDrones: Drone[];
}

export default function MissionPlannerModal({ open, onClose, availableDrones }: MissionPlannerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    droneId: "",
    altitude: 100,
    type: "survey",
    description: "",
  });
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/missions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Mission created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create mission", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const checkAirspaceMutation = useMutation({
    mutationFn: async (data: { waypoints: Waypoint[]; altitude: number }) => {
      const response = await apiRequest("POST", "/api/airspace/check", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.hasConflicts) {
        toast({
          title: "Airspace Conflicts Detected",
          description: `${result.conflicts.length} conflict(s) found. Please review your flight path.`,
          variant: "destructive",
        });
      } else {
        // Proceed with mission creation
        createMissionMutation.mutate({
          ...formData,
          waypoints,
        });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      droneId: "",
      altitude: 100,
      type: "survey",
      description: "",
    });
    setWaypoints([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.droneId || waypoints.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and add at least 2 waypoints.",
        variant: "destructive",
      });
      return;
    }

    // Check airspace conflicts first
    checkAirspaceMutation.mutate({
      waypoints,
      altitude: formData.altitude,
    });
  };

  const addWaypoint = () => {
    // Add a sample waypoint for demo
    const newWaypoint: Waypoint = {
      lat: 37.7749 + (Math.random() - 0.5) * 0.01,
      lng: -122.4194 + (Math.random() - 0.5) * 0.01,
      altitude: formData.altitude,
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const selectMissionType = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" data-testid="modal-title">Mission Planner</h2>
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Mission Name *</label>
            <input 
              type="text" 
              placeholder="Enter mission name" 
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="input-mission-name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assigned Drone *</label>
              <select 
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.droneId}
                onChange={(e) => setFormData(prev => ({ ...prev, droneId: e.target.value }))}
                data-testid="select-drone"
                required
              >
                <option value="">Select drone...</option>
                {availableDrones.map((drone) => (
                  <option key={drone.id} value={drone.id}>
                    {drone.id} ({drone.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Flight Altitude (ft) *</label>
              <input 
                type="number" 
                placeholder="100"
                min="10"
                max="400"
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.altitude}
                onChange={(e) => setFormData(prev => ({ ...prev, altitude: parseInt(e.target.value) || 100 }))}
                data-testid="input-altitude"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mission Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["survey", "patrol", "delivery"].map((type) => (
                <button 
                  key={type}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm capitalize ${
                    formData.type === type 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-foreground"
                  }`}
                  onClick={() => selectMissionType(type)}
                  data-testid={`button-type-${type}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Waypoints</label>
            <div className="border border-border rounded-md p-3 bg-muted">
              <div className="text-sm text-muted-foreground mb-2">
                Click on the map to add waypoints, or use the button below.
              </div>
              
              <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
                {waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm" data-testid={`waypoint-${index}`}>
                      WP-{index + 1}: {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                    </span>
                    <button 
                      type="button"
                      className="text-destructive hover:text-destructive/80 text-xs"
                      onClick={() => removeWaypoint(index)}
                      data-testid={`button-remove-waypoint-${index}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                {waypoints.length === 0 && (
                  <div className="text-sm text-muted-foreground py-2" data-testid="no-waypoints-message">
                    No waypoints added yet
                  </div>
                )}
              </div>
              
              <button
                type="button"
                className="px-3 py-1 bg-secondary text-foreground rounded text-sm hover:bg-secondary/80"
                onClick={addWaypoint}
                data-testid="button-add-waypoint"
              >
                Add Sample Waypoint
              </button>
            </div>
          </div>
        </form>
        
        <div className="p-4 border-t border-border flex justify-end space-x-3">
          <button 
            type="button"
            className="px-4 py-2 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </button>
          <button 
            type="button"
            className="px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80"
            data-testid="button-save-draft"
          >
            Save Draft
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={createMissionMutation.isPending || checkAirspaceMutation.isPending}
            data-testid="button-submit-mission"
          >
            {(createMissionMutation.isPending || checkAirspaceMutation.isPending) ? "Submitting..." : "Submit Mission"}
          </button>
        </div>
      </div>
    </div>
  );
}
