import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface MapLegendProps {
  onToggleLayer: (layerType: string, visible: boolean) => void;
  layerCounts: {
    drones: number;
    missions: number;
    geofences: number;
    noFlyZones: number;
    restrictedZones: number;
  };
}

export default function MapLegend({ onToggleLayer, layerCounts }: MapLegendProps) {
  const [visibleLayers, setVisibleLayers] = useState({
    drones: true,
    missions: true,
    geofences: true,
    noFlyZones: true,
    restrictedZones: true,
  });

  const handleToggle = (layerType: string, checked: boolean) => {
    setVisibleLayers(prev => ({ ...prev, [layerType]: checked }));
    onToggleLayer(layerType, checked);
  };

  const legendItems = [
    {
      id: "drones",
      label: "Active Drones",
      color: "#10b981",
      count: layerCounts.drones,
      icon: "🚁"
    },
    {
      id: "missions", 
      label: "Mission Paths",
      color: "#3b82f6",
      count: layerCounts.missions,
      icon: "🛤️"
    },
    {
      id: "restrictedZones",
      label: "Restricted Airspace",
      color: "#f59e0b",
      count: layerCounts.restrictedZones,
      icon: "⚠️"
    },
    {
      id: "noFlyZones",
      label: "No-Fly Zones",
      color: "#ef4444", 
      count: layerCounts.noFlyZones,
      icon: "🚫"
    },
    {
      id: "geofences",
      label: "Custom Geofences",
      color: "#8b5cf6",
      count: layerCounts.geofences,
      icon: "🔷"
    }
  ];

  return (
    <Card className="w-72 backdrop-blur-sm bg-card/90 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          Map Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {legendItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id={item.id}
                checked={visibleLayers[item.id as keyof typeof visibleLayers]}
                onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
                data-testid={`checkbox-layer-${item.id}`}
              />
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded border border-border/30"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {item.count}
            </Badge>
          </div>
        ))}
        
        <div className="pt-2 border-t border-border/30">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Total Features:</span>
              <span className="font-medium">
                {Object.values(layerCounts).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Layers:</span>
              <span className="font-medium">
                {Object.values(visibleLayers).filter(Boolean).length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}