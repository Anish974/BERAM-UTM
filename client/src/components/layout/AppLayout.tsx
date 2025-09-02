import { useState } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Toggle Button */}
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="bg-background/80 backdrop-blur-sm border shadow-md"
            data-testid="toggle-sidebar"
          >
            <i className={`fas fa-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'} text-sm`}></i>
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
}