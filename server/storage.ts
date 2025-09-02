import { 
  type User, type InsertUser,
  type Drone, type InsertDrone,
  type Mission, type InsertMission,
  type Telemetry, type InsertTelemetry,
  type Geofence, type InsertGeofence,
  type Alert, type InsertAlert,
  type Coordinate
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Drones
  getDrones(): Promise<Drone[]>;
  getDrone(id: string): Promise<Drone | undefined>;
  createDrone(drone: InsertDrone): Promise<Drone>;
  updateDrone(id: string, updates: Partial<Drone>): Promise<Drone | undefined>;
  
  // Missions
  getMissions(): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMission(id: string, updates: Partial<Mission>): Promise<Mission | undefined>;
  deleteMission(id: string): Promise<boolean>;
  
  // Telemetry
  getTelemetry(droneId: string, limit?: number): Promise<Telemetry[]>;
  addTelemetry(telemetry: InsertTelemetry): Promise<Telemetry>;
  
  // Geofences
  getGeofences(): Promise<Geofence[]>;
  getGeofence(id: string): Promise<Geofence | undefined>;
  createGeofence(geofence: InsertGeofence): Promise<Geofence>;
  updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence | undefined>;
  deleteGeofence(id: string): Promise<boolean>;
  
  // Alerts
  getAlerts(droneId?: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private drones: Map<string, Drone> = new Map();
  private missions: Map<string, Mission> = new Map();
  private telemetryData: Map<string, Telemetry[]> = new Map();
  private geofences: Map<string, Geofence> = new Map();
  private alerts: Map<string, Alert> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial drones
    const drone1: Drone = {
      id: "DRN-001",
      name: "Scout Alpha",
      model: "DJI Mavic 3",
      status: "active",
      battery: 87,
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 120,
      speed: 25,
      heading: 45,
      signalStrength: -65,
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    const drone2: Drone = {
      id: "DRN-002",
      name: "Survey Beta",
      model: "DJI Phantom 4",
      status: "mission",
      battery: 65,
      latitude: 37.7849,
      longitude: -122.4094,
      altitude: 85,
      speed: 18,
      heading: 120,
      signalStrength: -58,
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    const drone3: Drone = {
      id: "DRN-003",
      name: "Patrol Gamma",
      model: "Autel EVO II",
      status: "warning",
      battery: 23,
      latitude: 37.7649,
      longitude: -122.4294,
      altitude: 200,
      speed: 32,
      heading: 270,
      signalStrength: -72,
      lastSeen: new Date(),
      createdAt: new Date(),
    };

    this.drones.set(drone1.id, drone1);
    this.drones.set(drone2.id, drone2);
    this.drones.set(drone3.id, drone3);

    // Seed some geofences
    const noFlyZone: Geofence = {
      id: randomUUID(),
      name: "Airport No-Fly Zone",
      type: "no_fly",
      coordinates: [
        { lat: 37.7849, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4394 },
        { lat: 37.7949, lng: -122.4194 },
        { lat: 37.7849, lng: -122.4194 }
      ] as Coordinate[],
      minAltitude: 0,
      maxAltitude: 400,
      active: true,
      createdAt: new Date(),
    };

    const restrictedZone: Geofence = {
      id: randomUUID(),
      name: "Military Base Restricted",
      type: "restricted",
      coordinates: [
        { lat: 37.7549, lng: -122.4494 },
        { lat: 37.7649, lng: -122.4494 },
        { lat: 37.7649, lng: -122.4294 },
        { lat: 37.7549, lng: -122.4294 }
      ] as Coordinate[],
      minAltitude: 0,
      maxAltitude: 200,
      active: true,
      createdAt: new Date(),
    };

    this.geofences.set(noFlyZone.id, noFlyZone);
    this.geofences.set(restrictedZone.id, restrictedZone);

    // Seed an alert
    const lowBatteryAlert: Alert = {
      id: randomUUID(),
      droneId: "DRN-003",
      type: "battery_low",
      severity: "warning",
      title: "Low Battery Warning",
      message: "DRN-003 battery at 23%. Return to base recommended.",
      acknowledged: false,
      createdAt: new Date(),
    };

    this.alerts.set(lowBatteryAlert.id, lowBatteryAlert);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "operator",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Drones
  async getDrones(): Promise<Drone[]> {
    return Array.from(this.drones.values());
  }

  async getDrone(id: string): Promise<Drone | undefined> {
    return this.drones.get(id);
  }

  async createDrone(insertDrone: InsertDrone): Promise<Drone> {
    const drone: Drone = {
      ...insertDrone,
      status: insertDrone.status || "offline",
      battery: insertDrone.battery || 0,
      speed: insertDrone.speed || null,
      heading: insertDrone.heading || null,
      latitude: insertDrone.latitude || null,
      longitude: insertDrone.longitude || null,
      altitude: insertDrone.altitude || null,
      signalStrength: insertDrone.signalStrength || null,
      createdAt: new Date(),
      lastSeen: new Date(),
    };
    this.drones.set(drone.id, drone);
    return drone;
  }

  async updateDrone(id: string, updates: Partial<Drone>): Promise<Drone | undefined> {
    const drone = this.drones.get(id);
    if (!drone) return undefined;
    
    const updated = { ...drone, ...updates, lastSeen: new Date() };
    this.drones.set(id, updated);
    return updated;
  }

  // Missions
  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMission(id: string): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const id = randomUUID();
    const mission: Mission = {
      ...insertMission,
      id,
      status: insertMission.status || "planned",
      description: insertMission.description || null,
      droneId: insertMission.droneId || null,
      speed: insertMission.speed || null,
      geofences: insertMission.geofences || null,
      startTime: null,
      endTime: null,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.missions.set(id, mission);
    return mission;
  }

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    
    const updated = { ...mission, ...updates, updatedAt: new Date() };
    this.missions.set(id, updated);
    return updated;
  }

  async deleteMission(id: string): Promise<boolean> {
    return this.missions.delete(id);
  }

  // Telemetry
  async getTelemetry(droneId: string, limit = 100): Promise<Telemetry[]> {
    const data = this.telemetryData.get(droneId) || [];
    return data.slice(-limit);
  }

  async addTelemetry(insertTelemetry: InsertTelemetry): Promise<Telemetry> {
    const id = randomUUID();
    const telemetry: Telemetry = {
      ...insertTelemetry,
      id,
      timestamp: new Date(),
    };
    
    if (!this.telemetryData.has(insertTelemetry.droneId)) {
      this.telemetryData.set(insertTelemetry.droneId, []);
    }
    
    const droneData = this.telemetryData.get(insertTelemetry.droneId)!;
    droneData.push(telemetry);
    
    // Keep only last 1000 records per drone
    if (droneData.length > 1000) {
      droneData.splice(0, droneData.length - 1000);
    }
    
    return telemetry;
  }

  // Geofences
  async getGeofences(): Promise<Geofence[]> {
    return Array.from(this.geofences.values());
  }

  async getGeofence(id: string): Promise<Geofence | undefined> {
    return this.geofences.get(id);
  }

  async createGeofence(insertGeofence: InsertGeofence): Promise<Geofence> {
    const id = randomUUID();
    const geofence: Geofence = {
      ...insertGeofence,
      id,
      minAltitude: insertGeofence.minAltitude || 0,
      maxAltitude: insertGeofence.maxAltitude || 400,
      active: insertGeofence.active ?? true,
      createdAt: new Date(),
    };
    this.geofences.set(id, geofence);
    return geofence;
  }

  async updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence | undefined> {
    const geofence = this.geofences.get(id);
    if (!geofence) return undefined;
    
    const updated = { ...geofence, ...updates };
    this.geofences.set(id, updated);
    return updated;
  }

  async deleteGeofence(id: string): Promise<boolean> {
    return this.geofences.delete(id);
  }

  // Alerts
  async getAlerts(droneId?: string): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    if (droneId) {
      return alerts.filter(alert => alert.droneId === droneId);
    }
    return alerts;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      droneId: insertAlert.droneId || null,
      acknowledged: false,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async acknowledgeAlert(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    
    alert.acknowledged = true;
    this.alerts.set(id, alert);
    return true;
  }
}

export const storage = new MemStorage();
