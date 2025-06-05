
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { Package, Truck, DollarSign, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  const stats = [
    {
      title: t('dashboard.totalOrders'),
      value: "1,234",
      icon: Truck,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.totalProducts'),
      value: "567",
      icon: Package,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      change: "+8%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.totalRevenue'),
      value: "₽2,456,789",
      icon: DollarSign,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      change: "+15%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.activeDeliveries'),
      value: "23",
      icon: Clock,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      change: "+3",
      changeType: "increase" as const
    }
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Иван Петров",
      total: "₽850",
      status: "delivering",
      time: "15:30"
    },
    {
      id: "ORD-002", 
      customer: "Мария Сидорова",
      total: "₽1,200",
      status: "completed",
      time: "14:45"
    },
    {
      id: "ORD-003",
      customer: "Алексей Козлов", 
      total: "₽2,100",
      status: "pending",
      time: "16:00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'delivering': return 'text-blue-400 bg-blue-900/20';
      case 'completed': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('orders.pending');
      case 'delivering': return t('orders.delivering');
      case 'completed': return t('orders.completed');
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-400">Добро пожаловать в панель управления доставкой</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">{t('dashboard.recentOrders')}</h2>
                <button className="text-red-400 hover:text-red-300 transition-colors">
                  {t('dashboard.viewAll')}
                </button>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-200">
                    <div>
                      <p className="font-medium text-white">#{order.id}</p>
                      <p className="text-sm text-gray-400">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-400">{order.total}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Активность сегодня</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Новые заказы</span>
                  <span className="text-white font-semibold">+18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Завершенные доставки</span>
                  <span className="text-white font-semibold">+24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Новые клиенты</span>
                  <span className="text-white font-semibold">+7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Доход за день</span>
                  <span className="text-green-400 font-semibold">₽45,280</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
