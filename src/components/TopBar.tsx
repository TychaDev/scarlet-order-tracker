
import { Search, Bell, User } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export const TopBar = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-gray-950 border-b border-gray-800 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 w-80 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <User size={16} className="text-white" />
            </div>
            <span className="text-gray-300">{t('common.admin')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
