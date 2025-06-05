
import { Circle } from "lucide-react";

interface Server {
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: string;
  ram: string;
  storage: string;
}

interface ServerCardProps {
  server: Server;
  viewMode: 'grid' | 'list';
}

export const ServerCard = ({ server, viewMode }: ServerCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-900/20';
      case 'offline': return 'bg-red-900/20';
      case 'maintenance': return 'bg-yellow-900/20';
      default: return 'bg-gray-900/20';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBg(server.status)}`}>
              <Circle size={8} className={`fill-current ${getStatusColor(server.status)}`} />
              <span className={`text-sm font-medium ${getStatusColor(server.status)}`}>
                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{server.name}</h3>
              <p className="text-gray-400 text-sm">{server.ip}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-gray-400">CPU</p>
              <p className="text-white font-medium">{server.cpu}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">RAM</p>
              <p className="text-white font-medium">{server.ram}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Storage</p>
              <p className="text-white font-medium">{server.storage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{server.name}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBg(server.status)}`}>
          <Circle size={8} className={`fill-current ${getStatusColor(server.status)}`} />
          <span className={`text-sm font-medium ${getStatusColor(server.status)}`}>
            {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
          </span>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-6">{server.ip}</p>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-400 mb-1">CPU</p>
          <p className="text-white font-medium">{server.cpu}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 mb-1">RAM</p>
          <p className="text-white font-medium">{server.ram}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 mb-1">Storage</p>
          <p className="text-white font-medium">{server.storage}</p>
        </div>
      </div>
    </div>
  );
};
