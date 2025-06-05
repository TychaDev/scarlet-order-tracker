
import { Search, Bell, User } from "lucide-react";

export const TopBar = () => {
  return (
    <header className="bg-gray-950 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search servers, orders, products..."
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-300" />
            </div>
            <span className="text-gray-300">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
