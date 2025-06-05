
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ServerCard } from "@/components/ServerCard";
import { TopBar } from "@/components/TopBar";
import { Filter, Grid2X2, Grid3X3 } from "lucide-react";

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const servers = [
    {
      name: "Orders Server",
      ip: "192.168.1.10:8080",
      status: "online",
      cpu: "15.2%",
      ram: "2.4GB",
      storage: "8GB"
    },
    {
      name: "Products Server", 
      ip: "192.168.1.11:8080",
      status: "online",
      cpu: "8.7%",
      ram: "1.8GB", 
      storage: "12GB"
    },
    {
      name: "Delivery Tracking",
      ip: "192.168.1.12:8080", 
      status: "maintenance",
      cpu: "0.00%",
      ram: "0 Bytes",
      storage: "4GB"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Delivery Servers</h1>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter size={20} />
                Filter
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
                >
                  <Grid2X2 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'} transition-colors`}
                >
                  <Grid3X3 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {servers.map((server, index) => (
              <ServerCard key={index} server={server} viewMode={viewMode} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
