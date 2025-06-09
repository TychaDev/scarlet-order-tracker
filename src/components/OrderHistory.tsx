
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { History, Search, Phone, Package, Calendar, CreditCard } from 'lucide-react';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistory = ({ isOpen, onClose }: OrderHistoryProps) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchOrders = async () => {
    if (!searchPhone.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите номер телефона",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_history')
        .select('*')
        .ilike('customer_phone', `%${searchPhone}%`)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Ошибка поиска заказов:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось найти заказы",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Выполнен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-gray-800 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <History size={24} className="text-orange-400" />
            История заказов
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Поиск */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Введите номер телефона клиента..."
                className="bg-gray-700 border-orange-500/30 text-white"
                onKeyPress={(e) => e.key === 'Enter' && searchOrders()}
              />
            </div>
            <Button
              onClick={searchOrders}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search size={16} />
              )}
            </Button>
          </div>

          {/* Результаты */}
          {orders.length === 0 && searchPhone && !isLoading && (
            <div className="text-center py-8">
              <Phone size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400">Заказы не найдены</p>
            </div>
          )}

          {orders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Найдено заказов: {orders.length}
              </h3>
              
              {orders.map((order: any) => (
                <div key={order.id} className="bg-gray-700/50 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-semibold text-lg">
                        #{order.order_number}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                        <span className={`font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.completed_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400">
                        ₽{order.total_amount?.toLocaleString() || '0'}
                      </div>
                      {order.payment_method && (
                        <div className="text-sm text-gray-300 flex items-center gap-1 mt-1">
                          <CreditCard size={14} />
                          {getPaymentMethodText(order.payment_method)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-white font-medium mb-1">Клиент:</h5>
                      <p className="text-gray-300">{order.customer_name || 'Не указано'}</p>
                      <p className="text-gray-400 text-sm">{order.customer_phone}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-white font-medium mb-1">Адрес доставки:</h5>
                      <p className="text-gray-300">{order.customer_address || 'Не указан'}</p>
                    </div>
                  </div>

                  {order.items && (
                    <div className="mt-4">
                      <h5 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Package size={16} />
                        Состав заказа:
                      </h5>
                      <ul className="text-gray-300 text-sm space-y-1">
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
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
