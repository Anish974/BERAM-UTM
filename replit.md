# Drone UTM (Unmanned Traffic Management) System

## Overview

This is a comprehensive Drone UTM (Unmanned Traffic Management) system built as a full-stack web application. The system provides real-time monitoring, mission planning, and management capabilities for drone operations. It features a React-based frontend with a modern dark theme UI, an Express.js backend with WebSocket support for real-time data, and PostgreSQL database integration through Drizzle ORM. The application is designed for drone operators and mission controllers to manage fleets, plan missions with waypoint navigation, monitor telemetry data, manage geofences for airspace control, and handle alerts and safety notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React with TypeScript and follows a component-based architecture with shadcn/ui components for consistent styling. The UI implements a dark theme design system with CSS custom properties for theming. State management is handled through TanStack Query for server state and React hooks for local state. Real-time updates are managed via WebSocket connections with automatic reconnection logic. The application uses Wouter for lightweight client-side routing.

### Backend Architecture
The server is built with Express.js and TypeScript, providing RESTful APIs for CRUD operations and WebSocket endpoints for real-time data streaming. The architecture follows a layered approach with separate modules for routes, storage, and services. Authentication is implemented using JWT tokens with middleware-based route protection. The system includes service abstractions for MAVLink protocol integration (drone communication) and WebSocket management for broadcasting telemetry updates.

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes core entities: Users (authentication and authorization), Drones (fleet management with status tracking), Missions (flight plans with waypoints and progress tracking), Telemetry (real-time drone data), Geofences (airspace restrictions), and Alerts (safety notifications). The database supports complex relationships between entities and includes proper indexing for performance.

### Real-Time Communication
WebSocket integration provides live updates for telemetry data, mission progress, alert notifications, and drone status changes. The system implements connection management with automatic reconnection and heartbeat mechanisms. Broadcasting is handled efficiently to multiple connected clients with message filtering based on user permissions.

### Map Integration
The frontend integrates with Mapbox GL JS for interactive mapping capabilities, including drone position visualization, mission path rendering, geofence zone display, and drawing tools for mission planning. The system includes fallback mechanisms when Mapbox tokens are unavailable, ensuring the application remains functional.

### Security & Authentication
JWT-based authentication system with role-based access control (operators vs administrators). Protected API routes require valid tokens, and the WebSocket connection includes authentication validation. User sessions are managed securely with proper token expiration and refresh mechanisms.

## External Dependencies

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database toolkit with migrations support
- **Drizzle Kit**: Database migration and schema management tools

### Frontend Libraries
- **React**: Core UI framework with hooks and functional components
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for UI components

### Backend Services
- **Express.js**: Web server framework
- **WebSocket (ws)**: Real-time bidirectional communication
- **JWT**: Token-based authentication
- **connect-pg-simple**: PostgreSQL session store

### Mapping Services
- **Mapbox GL JS**: Interactive mapping and visualization
- **Mapbox GL Draw**: Drawing tools for mission planning
- Requires MAPBOX_ACCESS_TOKEN environment variable

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the full stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Communication Protocols
- **MAVLink**: Drone communication protocol (service layer implemented)
- **WebSocket**: Real-time data streaming between client and server
- **REST API**: Standard HTTP endpoints for CRUD operations