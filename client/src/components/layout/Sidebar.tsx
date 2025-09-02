import { Link, useLocation } from "wouter";

const navigation = [
  { name: "Live Map", href: "/", icon: "map-marked-alt" },
  { name: "Missions", href: "/missions", icon: "tasks" },
  { name: "Fleet", href: "/fleet", icon: "helicopter" },
  { name: "Airspace", href: "/airspace", icon: "shield-alt" },
  { name: "Analytics", href: "/analytics", icon: "chart-line" },
];

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-drone text-primary-foreground text-sm" data-testid="logo-icon"></i>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold" data-testid="app-title">BERAM UTM</h1>
              <p className="text-xs text-muted-foreground" data-testid="app-subtitle">Command Center</p>
            </div>
          )}
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div 
                    className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    title={collapsed ? item.name : undefined}
                  >
                    <i className={`fas fa-${item.icon} w-4 h-4`}></i>
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-xs" data-testid="user-avatar"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="user-name">Operator ANISH</p>
            <p className="text-xs text-muted-foreground" data-testid="user-role">ATC Controller</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
