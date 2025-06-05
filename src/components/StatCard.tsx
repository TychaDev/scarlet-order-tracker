
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
    <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300 hover-glow-orange neon-border-orange">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white text-glow-orange">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {changeType === 'increase' ? '↗' : '↘'} {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} shadow-lg shadow-orange-500/30`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};
