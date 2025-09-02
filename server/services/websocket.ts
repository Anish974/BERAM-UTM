import { WebSocketServer, WebSocket } from "ws";
import { storage } from "../storage";
import type { Telemetry, Drone, Alert } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data: any;
}

export function setupWebSocket(wss: WebSocketServer) {
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");
    clients.add(ws);

    // Send initial data
    sendInitialData(ws);

    ws.on("message", async (message: Buffer) => {
      try {
        const parsed: WebSocketMessage = JSON.parse(message.toString());
        await handleMessage(ws, parsed);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Broadcast telemetry updates
  async function broadcastTelemetryUpdate(telemetry: Telemetry) {
    const message = {
      type: "telemetry_update",
      data: telemetry
    };
    
    broadcast(message);
    
    // Also update drone position
    await storage.updateDrone(telemetry.droneId, {
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      altitude: telemetry.altitude,
      speed: telemetry.speed,
      heading: telemetry.heading,
      battery: telemetry.battery,
      signalStrength: telemetry.signalStrength,
    });
  }

  // Broadcast drone status updates
  function broadcastDroneUpdate(drone: Drone) {
    const message = {
      type: "drone_update",
      data: drone
    };
    broadcast(message);
  }

  // Broadcast alert updates
  function broadcastAlert(alert: Alert) {
    const message = {
      type: "alert",
      data: alert
    };
    broadcast(message);
  }

  function broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  async function sendInitialData(ws: WebSocket) {
    try {
      const [drones, missions, geofences, alerts] = await Promise.all([
        storage.getDrones(),
        storage.getMissions(),
        storage.getGeofences(),
        storage.getAlerts()
      ]);

      const initialData = {
        type: "initial_data",
        data: {
          drones,
          missions,
          geofences,
          alerts
        }
      };

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(initialData));
      }
    } catch (error) {
      console.error("Error sending initial data:", error);
    }
  }

  async function handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case "ping":
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "pong" }));
        }
        break;
        
      case "telemetry":
        // Handle incoming telemetry data
        const telemetry = await storage.addTelemetry(message.data);
        await broadcastTelemetryUpdate(telemetry);
        break;
        
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  // Simulate telemetry updates for demo
  setInterval(async () => {
    const drones = await storage.getDrones();
    
    for (const drone of drones) {
      if (drone.status === "active" || drone.status === "mission") {
        // Generate simulated telemetry
        const telemetry = {
          droneId: drone.id,
          latitude: drone.latitude! + (Math.random() - 0.5) * 0.001,
          longitude: drone.longitude! + (Math.random() - 0.5) * 0.001,
          altitude: drone.altitude! + (Math.random() - 0.5) * 5,
          speed: Math.max(0, drone.speed! + (Math.random() - 0.5) * 5),
          heading: (drone.heading! + (Math.random() - 0.5) * 10) % 360,
          battery: Math.max(0, drone.battery! - Math.random() * 0.1),
          signalStrength: drone.signalStrength! + (Math.random() - 0.5) * 5,
        };

        const saved = await storage.addTelemetry(telemetry);
        await broadcastTelemetryUpdate(saved);

        // Check for low battery alerts
        if (telemetry.battery < 25 && telemetry.battery > 20) {
          const existingAlerts = await storage.getAlerts(drone.id);
          const hasLowBatteryAlert = existingAlerts.some(
            alert => alert.type === "battery_low" && !alert.acknowledged
          );

          if (!hasLowBatteryAlert) {
            const alert = await storage.createAlert({
              droneId: drone.id,
              type: "battery_low",
              severity: "warning",
              title: "Low Battery Warning",
              message: `${drone.id} battery at ${Math.round(telemetry.battery)}%. Return to base recommended.`,
            });
            broadcastAlert(alert);
          }
        }
      }
    }
  }, 2000);

  return { broadcastTelemetryUpdate, broadcastDroneUpdate, broadcastAlert };
}
