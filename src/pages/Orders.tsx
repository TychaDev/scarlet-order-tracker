
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Orders = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { t } = useLanguage();

  const orders = [
    {
      id: "ORD-001",
      customer: "Иван Петров",
      address: "ул. Ленина, д. 15, кв. 23",
      phone: "+7 (999) 123-45-67",
      products: ["Пицца Маргарита", "Кола 0.5л"],
      total: "₽850",
      status: "delivering" as const,
      time: "15:30"
    },
    {
      id: "ORD-002", 
      customer: "Мария Сидорова",
      address: "пр. Мира, д. 42, кв. 78",
      phone: "+7 (999) 765-43-21",
      products: ["Бургер Классик", "Картофель фри", "Сок яблочный"],
      total: "₽1,200",
      status: "completed" as const,
      time: "14:45"
    },
    {
      id: "ORD-003",
      customer: "Алексей Козлов", 
      address: "ул. Советская, д. 88, кв. 12",
      phone: "+7 (999) 555-12-34",
      products: ["Роллы Филадельфия", "Васаби", "Имбирь"],
      total: "₽2,100",
      status: "pending" as const,
      time: "16:00"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-400" size={20} />;
      case 'delivering': return <Package className="text-blue-400" size={20} />;
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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {t('orders.title')}
            </h1>
            
            <div className="flex items-center gap-4">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/50 backdrop-blur text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              >
                <option value="all">{t('orders.allOrders')}</option>
                <option value="pending">{t('orders.pending')}</option>
                <option value="delivering">{t('orders.delivering')}</option>
                <option value="completed">{t('orders.completed')}</option>
                <option value="cancelled">{t('orders.cancelled')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-white">#{order.id}</h3>
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
                        {order.products.map((product, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span>•</span>
                            <span>{product}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400 mb-4">{order.total}</div>
                    <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/25">
                      {t('orders.details')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Orders;
