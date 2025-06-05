
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки заказов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заказы",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-400" size={20} />;
      case 'delivering': return <Package className="text-orange-400" size={20} />;
      case 'completed': return <CheckCircle className="text-green-400" size={20} />;
      case 'cancelled': return <XCircle className="text-red-400" size={20} />;
      default: return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('orders.pending');
      case 'delivering': return t('orders.delivering');
      case 'completed': return t('orders.completed');
      case 'cancelled': return t('orders.cancelled');
      default: return 'Неизвестно';
    }
  };

  const filteredOrders = orders.filter((order: any) => 
    filterStatus === 'all' || order.status === filterStatus
  );

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
              <p className="text-gray-400">Загрузка заказов...</p>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-glow-orange-intense">
              {t('orders.title')}
            </h1>
            
            <div className="flex items-center gap-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/60 backdrop-blur text-white px-4 py-2 rounded-lg border border-orange-500/30 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-200 neon-border-orange"
              >
                <option value="all">{t('orders.allOrders')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="delivering">{t('orders.delivering')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-12 text-center neon-border-orange">
              <Truck size={64} className="mx-auto mb-4 text-orange-400 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {orders.length === 0 ? 'Заказы отсутствуют' : 'Нет заказов с выбранным статусом'}
              </h2>
              <p className="text-gray-400 mb-6">
                {orders.length === 0 
                  ? 'Заказы будут отображаться здесь по мере их поступления'
                  : 'Попробуйте изменить фильтр статуса'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order: any) => (
                <div key={order.id} className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover-glow-orange neon-border-orange">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-white text-glow-orange-intense">#{order.order_number}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                        </div>
                        <span className="text-sm text-gray-400">{formatDate(order.created_at)}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">{t('orders.customer')}:</h4>
                          <p className="text-gray-300">{order.customer_name || 'Не указано'}</p>
                          <p className="text-gray-400 text-sm">{order.customer_phone || 'Телефон не указан'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-2">{t('orders.deliveryAddress')}:</h4>
                          <p className="text-gray-300">{order.customer_address || 'Адрес не указан'}</p>
                        </div>
                      </div>
                      
                      {order.items && (
                        <div className="mt-4">
                          <h4 className="text-white font-medium mb-2">{t('orders.products')}:</h4>
                          <ul className="text-gray-300 text-sm">
                            {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <span>•</span>
                                <span>{typeof item === 'string' ? item : item.name || 'Товар'}</span>
                                {typeof item === 'object' && item.quantity && (
                                  <span className="text-gray-400">x{item.quantity}</span>
                                )}
                              </li>
                            )) : (
                              <li className="text-gray-400">Состав заказа не указан</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400 mb-4 text-glow-orange-intense">
                        ₽{order.total_amount?.toLocaleString() || '0'}
                      </div>
                      <button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover-glow-orange">
                        {t('orders.details')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orders;
