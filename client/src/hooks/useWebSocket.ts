import { useState, useEffect, useRef } from "react";
import type { Drone, Mission, Telemetry, Alert, Geofence } from "@shared/schema";

interface WebSocketData {
  isConnected: boolean;
  drones: Drone[];
  missions: Mission[];
  telemetry: Record<string, Telemetry[]>;
  alerts: Alert[];
  geofences: Geofence[];
}

export function useWebSocket() {
  const [data, setData] = useState<WebSocketData>({
    isConnected: false,
    drones: [],
    missions: [],
    telemetry: {},
    alerts: [],
    geofences: [],
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setData(prev => ({ ...prev, isConnected: true }));
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setData(prev => ({ ...prev, isConnected: false }));
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  };

  const handleMessage = (message: any) => {
    switch (message.type) {
      case "initial_data":
        setData(prev => ({
          ...prev,
          drones: message.data.drones || [],
          missions: message.data.missions || [],
          alerts: message.data.alerts || [],
          geofences: message.data.geofences || [],
        }));
        break;

      case "telemetry_update":
        const telemetry = message.data;
        setData(prev => {
          const droneData = prev.telemetry[telemetry.droneId] || [];
          const updatedData = [...droneData, telemetry].slice(-100); // Keep last 100 records
          
          return {
            ...prev,
            telemetry: {
              ...prev.telemetry,
              [telemetry.droneId]: updatedData,
            },
          };
        });
        break;

      case "drone_update":
        const updatedDrone = message.data;
        setData(prev => ({
          ...prev,
          drones: prev.drones.map(drone => 
            drone.id === updatedDrone.id ? updatedDrone : drone
          ),
        }));
        break;

      case "alert":
        const newAlert = message.data;
        setData(prev => ({
          ...prev,
          alerts: [newAlert, ...prev.alerts],
        }));
        break;

      case "pong":
        // Heartbeat response
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();

    // Send ping every 30 seconds
    const pingInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000);

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      clearInterval(pingInterval);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    ...data,
    sendMessage,
  };
}
