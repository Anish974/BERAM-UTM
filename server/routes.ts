import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocket } from "./services/websocket";
import { authenticateToken, generateToken } from "./services/auth";
import { insertUserSchema, insertMissionSchema, insertGeofenceSchema } from "@shared/schema";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupWebSocket(wss);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      const token = generateToken(user.id);
      
      res.status(201).json({ 
        token, 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Protected routes middleware
  app.use("/api/protected/*", authenticateToken);

  // Drone routes
  app.get("/api/drones", async (req, res) => {
    try {
      const drones = await storage.getDrones();
      res.json(drones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drones" });
    }
  });

  app.get("/api/drones/:id", async (req, res) => {
    try {
      const drone = await storage.getDrone(req.params.id);
      if (!drone) {
        return res.status(404).json({ message: "Drone not found" });
      }
      res.json(drone);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drone" });
    }
  });

  app.get("/api/drones/:id/telemetry", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const telemetry = await storage.getTelemetry(req.params.id, limit);
      res.json(telemetry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch telemetry" });
    }
  });

  // Mission routes
  app.get("/api/missions", async (req, res) => {
    try {
      const missions = await storage.getMissions();
      res.json(missions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch missions" });
    }
  });

  app.get("/api/missions/:id", async (req, res) => {
    try {
      const mission = await storage.getMission(req.params.id);
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mission" });
    }
  });

  app.post("/api/missions", async (req, res) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      
      // Validate drone exists and is available
      const drone = await storage.getDrone(missionData.droneId!);
      if (!drone) {
        return res.status(400).json({ message: "Drone not found" });
      }
      
      if (drone.status === "mission") {
        return res.status(400).json({ message: "Drone is already on a mission" });
      }

      const mission = await storage.createMission(missionData);
      
      // Update drone status
      await storage.updateDrone(missionData.droneId!, { status: "mission" });
      
      res.status(201).json(mission);
    } catch (error) {
      res.status(400).json({ message: "Failed to create mission" });
    }
  });

  app.patch("/api/missions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const mission = await storage.updateMission(req.params.id, updates);
      
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }
      
      res.json(mission);
    } catch (error) {
      res.status(400).json({ message: "Failed to update mission" });
    }
  });

  app.delete("/api/missions/:id", async (req, res) => {
    try {
      const success = await storage.deleteMission(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Mission not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete mission" });
    }
  });

  // Airspace conflict checking
  app.post("/api/airspace/check", async (req, res) => {
    try {
      const { waypoints, altitude } = req.body;
      
      if (!waypoints || !altitude) {
        return res.status(400).json({ message: "Waypoints and altitude required" });
      }

      const geofences = await storage.getGeofences();
      const conflicts = [];

      for (const geofence of geofences) {
        if (!geofence.active) continue;
        
        // Simple point-in-polygon check for each waypoint
        for (const waypoint of waypoints) {
          if (isPointInPolygon(waypoint, geofence.coordinates) &&
              altitude >= geofence.minAltitude! &&
              altitude <= geofence.maxAltitude!) {
            conflicts.push({
              geofenceId: geofence.id,
              geofenceName: geofence.name,
              type: geofence.type,
              waypoint: waypoint
            });
          }
        }
      }

      res.json({ 
        hasConflicts: conflicts.length > 0, 
        conflicts 
      });
    } catch (error) {
      res.status(500).json({ message: "Airspace check failed" });
    }
  });

  // Geofence routes
  app.get("/api/geofences", async (req, res) => {
    try {
      const geofences = await storage.getGeofences();
      res.json(geofences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch geofences" });
    }
  });

  app.post("/api/geofences", async (req, res) => {
    try {
      const geofenceData = insertGeofenceSchema.parse(req.body);
      const geofence = await storage.createGeofence(geofenceData);
      res.status(201).json(geofence);
    } catch (error) {
      res.status(400).json({ message: "Failed to create geofence" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const droneId = req.query.droneId as string;
      const alerts = await storage.getAlerts(droneId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const success = await storage.acknowledgeAlert(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  return httpServer;
}

// Simple point-in-polygon algorithm
function isPointInPolygon(point: {lat: number, lng: number}, polygon: Array<{lat: number, lng: number}>): boolean {
  let inside = false;
  const x = point.lng;
  const y = point.lat;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}
