interface TopBarProps {
  isConnected: boolean;
  activeDroneCount: number;
  onNewMission: () => void;
}

export default function TopBar({ isConnected, activeDroneCount, onNewMission }: TopBarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold" data-testid="page-title">Mission Control</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div 
            className={`w-2 h-2 rounded-full status-indicator ${
              isConnected ? "bg-emerald-500" : "bg-red-500"
            }`}
            data-testid="system-status-indicator"
          ></div>
          <span data-testid="system-status-text">
            {isConnected ? "System Operational" : "System Offline"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div 
            className={`w-2 h-2 rounded-full status-indicator ${
              isConnected ? "bg-emerald-500" : "bg-red-500"
            }`}
            data-testid="websocket-status-indicator"
          ></div>
          <span className="text-muted-foreground" data-testid="websocket-status-text">
            {isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 bg-secondary px-3 py-1 rounded-full">
          <i className="fas fa-drone text-primary text-xs"></i>
          <span className="text-sm font-medium" data-testid="active-drone-count">
            {activeDroneCount} Active
          </span>
        </div>
        
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          onClick={onNewMission}
          data-testid="button-new-mission"
        >
          <i className="fas fa-plus mr-2"></i>New Mission
        </button>
      </div>
    </header>
  );
}
