
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [orders, setOrders] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Здесь будет подключение к реальной базе данных
    console.log("Загрузка заказов из базы данных...");
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-glow-orange">
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

          {orders.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-12 text-center neon-border-orange">
              <Truck size={64} className="mx-auto mb-4 text-orange-400 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">Заказы отсутствуют</h2>
              <p className="text-gray-400 mb-6">Подключите базу данных для отображения заказов</p>
              <div className="text-sm text-gray-500">
                <p>• Настройте подключение к базе данных</p>
                <p>• Синхронизируйте данные с приложением FlutterFlow</p>
                <p>• Заказы будут отображаться здесь автоматически</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover-glow-orange neon-border-orange">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-white text-glow-orange">#{order.id}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium">{getStatusText(order.status)}</span>
                        </div>
                        <span className="text-sm text-gray-400">{order.time}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">{t('orders.customer')}:</h4>
                          <p className="text-gray-300">{order.customer}</p>
                          <p className="text-gray-400 text-sm">{order.phone}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-2">{t('orders.deliveryAddress')}:</h4>
                          <p className="text-gray-300">{order.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-white font-medium mb-2">{t('orders.products')}:</h4>
                        <ul className="text-gray-300 text-sm">
                          {order.products?.map((product: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{product}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-400 mb-4 text-glow-orange">{order.total}</div>
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
