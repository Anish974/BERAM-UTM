import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/components/layout/AppLayout";
import type { Geofence, InsertGeofence, Coordinate } from "@shared/schema";

export default function Airspace() {
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [showAddGeofence, setShowAddGeofence] = useState(false);
  const [newGeofence, setNewGeofence] = useState<Partial<InsertGeofence>>({
    name: "",
    type: "warning",
    coordinates: [],
    minAltitude: 0,
    maxAltitude: 400,
    active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: geofences = [], isLoading } = useQuery({
    queryKey: ["/api/geofences"],
    queryFn: async () => {
      const response = await fetch("/api/geofences");
      return response.json();
    },
  });

  const addGeofenceMutation = useMutation({
    mutationFn: async (geofence: InsertGeofence) => {
      const response = await apiRequest("POST", "/api/geofences", geofence);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Geofence created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/geofences"] });
      setShowAddGeofence(false);
      setNewGeofence({
        name: "",
        type: "warning",
        coordinates: [],
        minAltitude: 0,
        maxAltitude: 400,
        active: true
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to create geofence", 
        variant: "destructive" 
      });
    },
  });

  const updateGeofenceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Geofence> }) => {
      const response = await apiRequest("PATCH", `/api/geofences/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Geofence updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/geofences"] });
    },
  });

  const deleteGeofenceMutation = useMutation({
    mutationFn: async (geofenceId: string) => {
      await apiRequest("DELETE", `/api/geofences/${geofenceId}`);
    },
    onSuccess: () => {
      toast({ title: "Geofence deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/geofences"] });
      setSelectedGeofence(null);
    },
    onError: () => {
      toast({ 
        title: "Failed to delete geofence", 
        variant: "destructive" 
      });
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "no_fly": return "bg-red-500";
      case "restricted": return "bg-amber-500";
      case "warning": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "no_fly": return "fa-ban";
      case "restricted": return "fa-exclamation-triangle";
      case "warning": return "fa-exclamation";
      default: return "fa-map-marker";
    }
  };

  const addSampleCoordinates = () => {
    const sampleCoords: Coordinate[] = [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4194 },
      { lat: 37.7849, lng: -122.4094 },
      { lat: 37.7749, lng: -122.4094 }
    ];
    setNewGeofence(prev => ({ ...prev, coordinates: sampleCoords }));
  };

  const handleAddGeofence = () => {
    if (!newGeofence.name || !newGeofence.coordinates || !Array.isArray(newGeofence.coordinates) || newGeofence.coordinates.length < 3) {
      toast({
        title: "Validation Error",
        description: "Please provide name and at least 3 coordinates",
        variant: "destructive"
      });
      return;
    }
    addGeofenceMutation.mutate(newGeofence as InsertGeofence);
  };

  const toggleGeofenceStatus = (geofence: Geofence) => {
    updateGeofenceMutation.mutate({
      id: geofence.id,
      updates: { active: !geofence.active }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading airspace...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="airspace-title">Airspace Management</h1>
        <Button onClick={() => setShowAddGeofence(true)} data-testid="button-add-geofence">
          <i className="fas fa-plus mr-2"></i>Create Geofence
        </Button>
      </div>

      {/* Airspace Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400" data-testid="stats-total-geofences">
                {geofences.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Zones</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400" data-testid="stats-no-fly">
                {geofences.filter((g: Geofence) => g.type === "no_fly").length}
              </div>
              <div className="text-sm text-muted-foreground">No-Fly Zones</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400" data-testid="stats-restricted">
                {geofences.filter((g: Geofence) => g.type === "restricted").length}
              </div>
              <div className="text-sm text-muted-foreground">Restricted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400" data-testid="stats-active">
                {geofences.filter((g: Geofence) => g.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geofence List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Geofence Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geofences.map((geofence: Geofence) => (
                  <div 
                    key={geofence.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-secondary ${
                      selectedGeofence?.id === geofence.id ? "border-primary bg-secondary" : ""
                    }`}
                    onClick={() => setSelectedGeofence(geofence)}
                    data-testid={`geofence-item-${geofence.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <i className={`fas ${getTypeIcon(geofence.type)} text-sm`}></i>
                        <h3 className="font-semibold" data-testid={`geofence-name-${geofence.id}`}>
                          {geofence.name}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(geofence.type)} data-testid={`geofence-type-${geofence.id}`}>
                          {geofence.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={geofence.active ? "default" : "secondary"} data-testid={`geofence-status-${geofence.id}`}>
                          {geofence.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Altitude: {geofence.minAltitude}ft - {geofence.maxAltitude}ft</p>
                      <p>Coordinates: {Array.isArray(geofence.coordinates) ? geofence.coordinates.length : 0} points</p>
                    </div>
                  </div>
                ))}
                
                {geofences.length === 0 && (
                  <div className="text-center text-muted-foreground py-8" data-testid="no-geofences">
                    No geofences defined
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geofence Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Geofence Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGeofence ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <i className={`fas ${getTypeIcon(selectedGeofence.type)} text-sm`}></i>
                      <span data-testid="selected-geofence-name">{selectedGeofence.name}</span>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge className={getTypeColor(selectedGeofence.type)}>
                        {selectedGeofence.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={selectedGeofence.active ? "default" : "secondary"}>
                        {selectedGeofence.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Altitude:</span>
                      <span>{selectedGeofence.minAltitude}ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Altitude:</span>
                      <span>{selectedGeofence.maxAltitude}ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span>{Array.isArray(selectedGeofence.coordinates) ? selectedGeofence.coordinates.length : 0} points</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        size="sm"
                        variant={selectedGeofence.active ? "outline" : "default"}
                        onClick={() => toggleGeofenceStatus(selectedGeofence)}
                        className="w-full"
                        data-testid="button-toggle-geofence"
                      >
                        {selectedGeofence.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteGeofenceMutation.mutate(selectedGeofence.id)}
                        disabled={deleteGeofenceMutation.isPending}
                        className="w-full"
                        data-testid="button-delete-geofence"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="no-geofence-selected">
                  Select a geofence to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Geofence Dialog */}
      <Dialog open={showAddGeofence} onOpenChange={setShowAddGeofence}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Geofence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="geofence-name">Name *</Label>
              <Input
                id="geofence-name"
                placeholder="No-Fly Zone Alpha"
                value={newGeofence.name}
                onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-geofence-name"
              />
            </div>
            <div>
              <Label htmlFor="geofence-type">Type *</Label>
              <Select 
                value={newGeofence.type} 
                onValueChange={(value) => setNewGeofence(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger data-testid="select-geofence-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_fly">No-Fly Zone</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min-altitude">Min Altitude (ft)</Label>
                <Input
                  id="min-altitude"
                  type="number"
                  value={newGeofence.minAltitude || 0}
                  onChange={(e) => setNewGeofence(prev => ({ ...prev, minAltitude: parseInt(e.target.value) || 0 }))}
                  data-testid="input-min-altitude"
                />
              </div>
              <div>
                <Label htmlFor="max-altitude">Max Altitude (ft)</Label>
                <Input
                  id="max-altitude"
                  type="number"
                  value={newGeofence.maxAltitude || 400}
                  onChange={(e) => setNewGeofence(prev => ({ ...prev, maxAltitude: parseInt(e.target.value) || 400 }))}
                  data-testid="input-max-altitude"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={newGeofence.active || false}
                onCheckedChange={(checked) => setNewGeofence(prev => ({ ...prev, active: checked }))}
                data-testid="switch-geofence-active"
              />
              <Label>Active by default</Label>
            </div>
            <div>
              <Label>Coordinates</Label>
              <div className="text-sm text-muted-foreground mb-2">
                {newGeofence.coordinates && newGeofence.coordinates.length > 0 
                  ? `${newGeofence.coordinates.length} coordinates defined`
                  : "No coordinates defined"
                }
              </div>
              <Button 
                type="button"
                variant="outline"
                onClick={addSampleCoordinates}
                className="w-full"
                data-testid="button-add-sample-coords"
              >
                Add Sample Coordinates
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddGeofence(false)}
                className="flex-1"
                data-testid="button-cancel-geofence"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddGeofence}
                disabled={addGeofenceMutation.isPending}
                className="flex-1"
                data-testid="button-save-geofence"
              >
                {addGeofenceMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}