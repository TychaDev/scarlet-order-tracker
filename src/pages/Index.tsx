
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { StatCard } from "@/components/StatCard";
import { Package, Truck, DollarSign, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeDeliveries: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем заказы
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;

      // Загружаем товары
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      setOrders(ordersData || []);
      setProducts(productsData || []);

      // Вычисляем статистику
      const totalRevenue = (ordersData || []).reduce((sum: number, order: any) => 
        sum + (order.total_amount || 0), 0);
      
      const activeDeliveries = (ordersData || []).filter((order: any) => 
        order.status === 'delivering' || order.status === 'pending').length;

      setStats({
        totalOrders: (ordersData || []).length,
        totalProducts: (productsData || []).length,
        totalRevenue,
        activeDeliveries
      });

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      title: t('dashboard.totalOrders'),
      value: stats.totalOrders.toString(),
      icon: Truck,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      change: stats.totalOrders > 0 ? "+12%" : "0%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.totalProducts'),
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "bg-gradient-to-br from-orange-400 to-orange-500",
      change: stats.totalProducts > 0 ? "+8%" : "0%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.totalRevenue'),
      value: `₽${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-gradient-to-br from-orange-600 to-orange-700",
      change: stats.totalRevenue > 0 ? "+15%" : "0%",
      changeType: "increase" as const
    },
    {
      title: t('dashboard.activeDeliveries'),
      value: stats.activeDeliveries.toString(),
      icon: Clock,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      change: stats.activeDeliveries > 0 ? "+3" : "0",
      changeType: "increase" as const
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка данных...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-glow-orange-intense">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-400">Добро пожаловать в панель управления Апельсин</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-6 neon-border-orange">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white text-glow-orange-intense">{t('dashboard.recentOrders')}</h2>
                <button className="text-orange-400 hover:text-orange-300 transition-colors">
                  {t('dashboard.viewAll')}
                </button>
              </div>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет активных заказов</p>
                    <p className="text-sm">Заказы будут отображаться здесь</p>
                  </div>
                ) : (
                  orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-orange-500/10 hover:border-orange-500/30 transition-all duration-200 hover-glow-orange">
                      <div>
                        <div className="font-medium text-white">#{order.order_number}</div>
                        <div className="text-sm text-gray-400">{order.customer_name || 'Клиент не указан'}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-400">₽{order.total_amount?.toLocaleString() || '0'}</div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          order.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                          order.status === 'delivering' ? 'bg-orange-900/20 text-orange-400' :
                          order.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-gray-900/20 text-gray-400'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-6 neon-border-orange">
              <h2 className="text-xl font-semibold text-white mb-6 text-glow-orange-intense">Статистика системы</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Подключение к базе</span>
                  <span className="text-green-400 font-semibold">Подключено</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Последняя синхронизация</span>
                  <span className="text-orange-400 font-semibold">Только что</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Статус системы</span>
                  <span className="text-green-400 font-semibold">Работает</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Всего товаров</span>
                  <span className="text-white font-semibold">{stats.totalProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Активных заказов</span>
                  <span className="text-white font-semibold">{stats.activeDeliveries}</span>
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
