
import { useState } from "react";
import { Home, Package, Truck, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { icon: Home, label: t('nav.dashboard'), path: "/" },
    { icon: Package, label: t('nav.products'), path: "/products" },
    { icon: Truck, label: t('nav.orders'), path: "/orders" },
    { icon: Settings, label: t('nav.settings'), path: "/settings" }
  ];

  return (
    <div className={`bg-gray-950 border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shadow-2xl`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
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
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={20} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
