
import { useState } from "react";
import { Home, Package, Truck, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminSettings } from "./AdminSettings";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { icon: Home, label: t('nav.dashboard'), path: "/" },
    { icon: Package, label: t('nav.products'), path: "/products" },
    { icon: Truck, label: t('nav.orders'), path: "/orders" }
  ];

  return (
    <>
      <div className={`bg-gray-900 border-r border-orange-500/20 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} shadow-2xl shadow-orange-500/10`}>
        <div className="p-4 border-b border-orange-500/30">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="logo-container w-10 h-10 rounded-lg flex items-center justify-center relative">
                  <img 
                    src="https://imgur.com/wttBiky.png" 
                    alt="Апельсин"
                    className="w-8 h-8 object-contain logo-glow"
                  />
                </div>
                <span className="text-white font-bold text-xl text-glow-orange-intense">Апельсин</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 text-gray-400 hover:text-orange-400 transition-colors"
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
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 glow-orange' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:shadow-orange-500/10'
                    }`}
                  >
                    <Icon size={20} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
            
            <li className="pt-4 border-t border-orange-500/20">
              <button
                onClick={() => setShowAdminSettings(true)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-800/50 hover:shadow-orange-500/10 w-full"
              >
                <Settings size={20} />
                {!collapsed && <span className="font-medium">{t('nav.settings')}</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <AdminSettings 
        isOpen={showAdminSettings}
        onClose={() => setShowAdminSettings(false)}
      />
    </>
  );
};
