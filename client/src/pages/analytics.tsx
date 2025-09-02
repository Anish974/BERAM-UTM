import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";
import type { Mission, Drone, Alert } from "@shared/schema";

export default function Analytics() {
  const { data: missions = [] } = useQuery({
    queryKey: ["/api/missions"],
    queryFn: async () => {
      const response = await fetch("/api/missions");
      return response.json();
    },
  });

  const { data: drones = [] } = useQuery({
    queryKey: ["/api/drones"],
    queryFn: async () => {
      const response = await fetch("/api/drones");
      return response.json();
    },
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: async () => {
      const response = await fetch("/api/alerts");
      return response.json();
    },
  });

  // Calculate analytics
  const totalFlightTime = missions.reduce((total: number, mission: Mission) => {
    if (mission.status === "completed" && mission.startTime && mission.endTime) {
      const start = new Date(mission.startTime).getTime();
      const end = new Date(mission.endTime).getTime();
      return total + (end - start) / (1000 * 60 * 60); // Convert to hours
    }
    return total;
  }, 0);

  const averageBattery = drones.length > 0 
    ? drones.reduce((sum: number, drone: Drone) => sum + (drone.battery || 0), 0) / drones.length
    : 0;

  const missionsByType = missions.reduce((acc: Record<string, number>, mission: Mission) => {
    acc[mission.type] = (acc[mission.type] || 0) + 1;
    return acc;
  }, {});

  const alertsBySeverity = alerts.reduce((acc: Record<string, number>, alert: Alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "error": return "bg-red-500";
      case "warning": return "bg-amber-500";
      case "info": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "survey": return "bg-blue-500";
      case "patrol": return "bg-emerald-500";
      case "delivery": return "bg-purple-500";
      case "inspection": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="analytics-title">Analytics Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400" data-testid="metric-total-missions">
                {missions.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Missions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400" data-testid="metric-completed-missions">
                {missions.filter((m: Mission) => m.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400" data-testid="metric-flight-time">
                {totalFlightTime.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Flight Time</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400" data-testid="metric-avg-battery">
                {averageBattery.toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Battery</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["planned", "active", "paused", "completed", "cancelled"].map((status) => {
                const count = missions.filter((m: Mission) => m.status === status).length;
                const percentage = missions.length > 0 ? (count / missions.length) * 100 : 0;
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{status}</span>
                      <span>{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                        data-testid={`progress-${status}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mission Types */}
        <Card>
          <CardHeader>
            <CardTitle>Missions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(missionsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(type)} data-testid={`mission-type-${type}`}>
                      {type}
                    </Badge>
                  </div>
                  <span className="font-semibold">{String(count)}</span>
                </div>
              ))}
              
              {Object.keys(missionsByType).length === 0 && (
                <div className="text-center text-muted-foreground py-4" data-testid="no-mission-types">
                  No mission data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Health */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-400" data-testid="fleet-active">
                    {drones.filter((d: Drone) => d.status === "active" || d.status === "mission").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Drones</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-400" data-testid="fleet-warnings">
                    {drones.filter((d: Drone) => d.status === "warning").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Battery Levels</h4>
                <div className="space-y-2">
                  {drones.map((drone: Drone) => (
                    <div key={drone.id} className="flex items-center justify-between text-sm">
                      <span>{drone.id}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (drone.battery || 0) > 50 ? "bg-emerald-500" :
                              (drone.battery || 0) > 25 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${drone.battery || 0}%` }}
                          />
                        </div>
                        <span className="font-mono w-8">{Math.round(drone.battery || 0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(alertsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className="text-xl font-bold">
                      <Badge className={getSeverityColor(severity)} data-testid={`alert-${severity}`}>
                        {String(count)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{severity}</div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recent Alerts</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {alerts.slice(0, 5).map((alert: Alert) => (
                    <div key={alert.id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                      <span className="truncate">{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <div className="text-center text-muted-foreground py-4" data-testid="no-alerts">
                      No recent alerts
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">
                {missions.filter((m: Mission) => m.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Missions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">
                {missions.length > 0 ? 
                  ((missions.filter((m: Mission) => m.status === "completed").length / missions.length) * 100).toFixed(0)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {drones.length > 0 ? (totalFlightTime / drones.length).toFixed(1) : 0}h
              </div>
              <div className="text-sm text-muted-foreground">Avg per Drone</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400">
                {alerts.filter((a: Alert) => !a.acknowledged).length}
              </div>
              <div className="text-sm text-muted-foreground">Open Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}