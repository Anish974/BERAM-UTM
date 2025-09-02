import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";

interface AlertPanelProps {
  alerts: Alert[];
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-600 border-red-500";
    case "error":
      return "bg-red-600 border-red-500";
    case "warning":
      return "bg-amber-600 border-amber-500";
    case "info":
      return "bg-blue-600 border-blue-500";
    default:
      return "bg-gray-600 border-gray-500";
  }
};

const getSeverityIcon = (type: string) => {
  switch (type) {
    case "battery_low":
      return "fa-battery-quarter";
    case "signal_weak":
      return "fa-wifi";
    case "geofence_violation":
      return "fa-exclamation-triangle";
    case "maintenance_required":
      return "fa-wrench";
    default:
      return "fa-exclamation-triangle";
  }
};

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const queryClient = useQueryClient();
  
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest("PATCH", `/api/alerts/${alertId}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);

  if (unacknowledgedAlerts.length === 0) {
    return null;
  }

  const handleDismissAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 z-10">
      {unacknowledgedAlerts.map((alert) => {
        const severityColor = getSeverityColor(alert.severity);
        const icon = getSeverityIcon(alert.type);
        
        return (
          <div 
            key={alert.id}
            className={`mb-2 p-3 text-white rounded-lg shadow-lg border ${severityColor}`}
            data-testid={`alert-${alert.id}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <i className={`fas ${icon}`}></i>
                <span className="font-medium text-sm" data-testid={`alert-title-${alert.id}`}>
                  {alert.title}
                </span>
              </div>
              <button 
                className="text-white/80 hover:text-white"
                onClick={() => handleDismissAlert(alert.id)}
                disabled={acknowledgeAlertMutation.isPending}
                data-testid={`button-dismiss-alert-${alert.id}`}
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <p className="text-xs mt-1" data-testid={`alert-message-${alert.id}`}>
              {alert.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}
