
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Package, Clock, CheckCircle, XCircle, Truck, Users, CreditCard, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_status_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Статус заказа обновлен",
      });

      // Перезагружаем заказы
      loadOrders();
    } catch (error: any) {
      console.error('Ошибка обновления статуса:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="text-orange-400" size={20} />;
      case 'processing': return <Clock className="text-blue-400" size={20} />;
      case 'awaiting_courier': return <Users className="text-purple-400" size={20} />;
      case 'delivering': return <Truck className="text-yellow-400" size={20} />;
      case 'completed': return <CheckCircle className="text-green-400" size={20} />;
      case 'cancelled': return <XCircle className="text-red-400" size={20} />;
      default: return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'В сборке';
      case 'processing': return 'В сборке';
      case 'awaiting_courier': return 'Ожидание курьера';
      case 'delivering': return 'Курьер в пути';
      case 'completed': return 'Выполнен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'halyk_bank': return 'Halyk Bank';
      case 'kaspi_bank': return 'Kaspi Bank';
      case 'cash': return 'Наличные';
      default: return 'Не указано';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'halyk_bank': return <CreditCard className="text-blue-400" size={16} />;
      case 'kaspi_bank': return <CreditCard className="text-red-400" size={16} />;
      case 'cash': return <Package className="text-green-400" size={16} />;
      default: return <CreditCard className="text-gray-400" size={16} />;
    }
  };

  const canChangeStatus = (currentStatus: string) => {
    return !['completed', 'cancelled'].includes(currentStatus);
  };

  const getNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
      case 'processing':
        return [
          { value: 'awaiting_courier', label: 'Ожидание курьера' },
          { value: 'delivering', label: 'Курьер в пути' },
          { value: 'completed', label: 'Выполнен' },
          { value: 'cancelled', label: 'Отменен' }
        ];
      case 'awaiting_courier':
        return [
          { value: 'delivering', label: 'Курьер в пути' },
          { value: 'completed', label: 'Выполнен' },
          { value: 'cancelled', label: 'Отменен' }
        ];
      case 'delivering':
        return [
          { value: 'completed', label: 'Выполнен' },
          { value: 'cancelled', label: 'Отменен' }
        ];
      default:
        return [];
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
                <option value="all">Все заказы</option>
                <option value="pending">В сборке</option>
                <option value="processing">В сборке</option>
                <option value="awaiting_courier">Ожидание курьера</option>
                <option value="delivering">Курьер в пути</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
          </div>

          {/* Статистика заказов */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {[
              { status: 'pending', label: 'В сборке', color: 'orange', icon: Package },
              { status: 'awaiting_courier', label: 'Ожидание курьера', color: 'purple', icon: Users },
              { status: 'delivering', label: 'Курьер в пути', color: 'yellow', icon: Truck },
              { status: 'completed', label: 'Выполнен', color: 'green', icon: CheckCircle },
              { status: 'cancelled', label: 'Отменен', color: 'red', icon: XCircle },
              { status: 'all', label: 'Всего', color: 'blue', icon: Package }
            ].map(({ status, label, color, icon: Icon }) => {
              const count = status === 'all' 
                ? orders.length 
                : orders.filter((order: any) => order.status === status || (status === 'pending' && order.status === 'processing')).length;
              
              return (
                <div key={status} className={`bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-${color}-500/20`}>
                  <div className="flex items-center gap-3">
                    <Icon size={24} className={`text-${color}-400`} />
                    <div>
                      <p className="text-gray-400 text-xs">{label}</p>
                      <p className="text-white text-lg font-bold">{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
                        {order.payment_method && (
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            {getPaymentMethodIcon(order.payment_method)}
                            <span>{getPaymentMethodText(order.payment_method)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <Phone size={16} />
                            Клиент:
                          </h4>
                          <p className="text-gray-300">{order.customer_name || 'Не указано'}</p>
                          <p className="text-gray-400 text-sm">{order.customer_phone || 'Телефон не указан'}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-2">Адрес доставки:</h4>
                          <p className="text-gray-300">{order.customer_address || 'Адрес не указан'}</p>
                        </div>
                      </div>
                      
                      {order.items && (
                        <div className="mt-4">
                          <h4 className="text-white font-medium mb-2">Состав заказа:</h4>
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
                    
                    <div className="text-right space-y-4">
                      <div className="text-2xl font-bold text-orange-400 mb-4 text-glow-orange-intense">
                        ₽{order.total_amount?.toLocaleString() || '0'}
                      </div>
                      
                      {canChangeStatus(order.status) ? (
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                        >
                          <SelectTrigger className="w-48 bg-gray-700 border-orange-500/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-orange-500/30">
                            <SelectItem value={order.status}>{getStatusText(order.status)}</SelectItem>
                            {getNextStatuses(order.status).map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-2 rounded">
                          Заказ завершен
                        </div>
                      )}
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
