
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export const StatCard = ({ title, value, icon: Icon, color, change, changeType }: StatCardProps) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'increase' ? '↗' : '↘'} {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};
