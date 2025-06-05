
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: "PROD-001",
      name: "Пицца Маргарита",
      category: "Пицца",
      price: "₽650",
      stock: 25,
      description: "Классическая пицца с томатами, моцареллой и базиликом"
    },
    {
      id: "PROD-002",
      name: "Бургер Классик",
      category: "Бургеры", 
      price: "₽450",
      stock: 18,
      description: "Сочная котлета из говядины с овощами и соусом"
    },
    {
      id: "PROD-003",
      name: "Роллы Филадельфия",
      category: "Суши",
      price: "₽850",
      stock: 12,
      description: "Роллы с лососем, сливочным сыром и авокадо"
    },
    {
      id: "PROD-004",
      name: "Картофель фри",
      category: "Гарниры",
      price: "₽180",
      stock: 45,
      description: "Хрустящий картофель фри с морской солью"
    },
    {
      id: "PROD-005",
      name: "Кола 0.5л",
      category: "Напитки",
      price: "₽120",
      stock: 67,
      description: "Прохладительный напиток Coca-Cola"
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { color: 'text-red-400', bg: 'bg-red-900/20', text: 'Низкий остаток' };
    if (stock <= 15) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', text: 'Средний остаток' };
    return { color: 'text-green-400', bg: 'bg-green-900/20', text: 'В наличии' };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Управление товарами</h1>
            
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus size={20} />
              Добавить товар
            </button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              
              return (
                <div key={product.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                      <span className="text-sm text-gray-400">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-red-400">{product.price}</div>
                    <div className={`px-3 py-1 rounded-full ${stockStatus.bg}`}>
                      <span className={`text-sm font-medium ${stockStatus.color}`}>
                        {product.stock} шт.
                      </span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg ${stockStatus.bg} text-center`}>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;
