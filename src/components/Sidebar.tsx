
import { useState } from "react";
import { Home, Package, Truck, Settings, Key, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Servers", path: "/", active: true },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Truck, label: "Orders", path: "/orders" },
    { icon: Key, label: "API Keys", path: "/api-keys" },
    { icon: Shield, label: "SSH Keys", path: "/ssh-keys" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className={`bg-gray-950 border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-white font-semibold">DeliverySanta</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
