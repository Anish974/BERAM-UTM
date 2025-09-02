import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("operator"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drones = pgTable("drones", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  status: text("status").notNull().default("offline"), // offline, idle, active, mission, warning, error
  battery: real("battery").default(0),
  latitude: real("latitude"),
  longitude: real("longitude"),
  altitude: real("altitude"),
  speed: real("speed"),
  heading: real("heading"),
  signalStrength: real("signal_strength"),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  droneId: varchar("drone_id").references(() => drones.id),
  status: text("status").notNull().default("planned"), // planned, active, paused, completed, cancelled
  type: text("type").notNull(), // survey, patrol, delivery, inspection
  waypoints: jsonb("waypoints").notNull(), // Array of {lat, lng, altitude}
  geofences: jsonb("geofences"), // Array of polygon coordinates
  altitude: real("altitude").notNull(),
  speed: real("speed").default(10),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  progress: real("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const telemetry = pgTable("telemetry", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  droneId: varchar("drone_id").notNull().references(() => drones.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  altitude: real("altitude").notNull(),
  speed: real("speed").notNull(),
  heading: real("heading").notNull(),
  battery: real("battery").notNull(),
  signalStrength: real("signal_strength").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const geofences = pgTable("geofences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // no_fly, restricted, warning
  coordinates: jsonb("coordinates").notNull(), // Polygon coordinates
  minAltitude: real("min_altitude").default(0),
  maxAltitude: real("max_altitude").default(400),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  droneId: varchar("drone_id").references(() => drones.id),
  type: text("type").notNull(), // battery_low, signal_weak, geofence_violation, maintenance_required
  severity: text("severity").notNull(), // info, warning, error, critical
  title: text("title").notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDroneSchema = createInsertSchema(drones).omit({ createdAt: true, lastSeen: true });
export const insertMissionSchema = createInsertSchema(missions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  progress: true,
  startTime: true,
  endTime: true 
});
export const insertTelemetrySchema = createInsertSchema(telemetry).omit({ id: true, timestamp: true });
export const insertGeofenceSchema = createInsertSchema(geofences).omit({ id: true, createdAt: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true, acknowledged: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Drone = typeof drones.$inferSelect;
export type InsertDrone = z.infer<typeof insertDroneSchema>;
export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Telemetry = typeof telemetry.$inferSelect;
export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;
export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Waypoint and coordinate types
export type Waypoint = {
  lat: number;
  lng: number;
  altitude: number;
};

export type Coordinate = {
  lat: number;
  lng: number;
};
