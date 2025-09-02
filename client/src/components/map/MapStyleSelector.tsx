import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MapStyleSelectorProps {
  onStyleChange: (style: string) => void;
  currentStyle: string;
}

export default function MapStyleSelector({ onStyleChange, currentStyle }: MapStyleSelectorProps) {
  const mapStyles = [
    {
      id: "satellite",
      name: "Satellite",
      description: "High-resolution satellite imagery",
      style: "mapbox://styles/mapbox/satellite-v9",
      icon: "🛰️"
    },
    {
      id: "streets",
      name: "Streets",
      description: "Detailed street map with labels",
      style: "mapbox://styles/mapbox/streets-v11",
      icon: "🗺️"
    },
    {
      id: "light",
      name: "Light",
      description: "Clean light theme for data visualization",
      style: "mapbox://styles/mapbox/light-v10", 
      icon: "☀️"
    },
    {
      id: "dark",
      name: "Dark",
      description: "Dark theme for reduced eye strain",
      style: "mapbox://styles/mapbox/dark-v10",
      icon: "🌙"
    },
    {
      id: "outdoors",
      name: "Outdoors",
      description: "Topographic features and trails",
      style: "mapbox://styles/mapbox/outdoors-v11",
      icon: "🏔️"
    },
    {
      id: "navigation",
      name: "Navigation",
      description: "Optimized for turn-by-turn directions",
      style: "mapbox://styles/mapbox/navigation-day-v1",
      icon: "🧭"
    }
  ];

  const getCurrentStyleName = () => {
    const current = mapStyles.find(style => style.style === currentStyle);
    return current ? current.name : "Satellite";
  };

  const getCurrentStyleIcon = () => {
    const current = mapStyles.find(style => style.style === currentStyle);
    return current ? current.icon : "🛰️";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-card/90 backdrop-blur-sm border-border/50 hover:bg-secondary"
          data-testid="button-map-style-selector"
        >
          <span className="mr-2">{getCurrentStyleIcon()}</span>
          {getCurrentStyleName()}
          <Badge variant="secondary" className="ml-2 text-xs">
            Style
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {mapStyles.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onClick={() => onStyleChange(style.style)}
            className={`cursor-pointer p-3 ${
              currentStyle === style.style ? "bg-secondary" : ""
            }`}
            data-testid={`menu-item-style-${style.id}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{style.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{style.name}</span>
                  {currentStyle === style.style && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {style.description}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}