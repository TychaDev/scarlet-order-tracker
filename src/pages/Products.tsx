
import { useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Plus, Edit, Trash2, Search, Upload, FileUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Пожалуйста, выберите XML файл');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      // Парсим XML файл с товарами
      const items = xmlDoc.getElementsByTagName('item') || xmlDoc.getElementsByTagName('product');
      const newProducts = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = {
          id: item.getAttribute('id') || `PROD-${Date.now()}-${i}`,
          name: item.getElementsByTagName('name')[0]?.textContent || 'Неизвестный товар',
          category: item.getElementsByTagName('category')[0]?.textContent || 'Без категории',
          price: item.getElementsByTagName('price')[0]?.textContent || '0',
          stock: parseInt(item.getElementsByTagName('stock')[0]?.textContent || '0'),
          description: item.getElementsByTagName('description')[0]?.textContent || 'Описание отсутствует'
        };
        newProducts.push(product);
      }
      
      setProducts(newProducts);
      console.log(`Загружено ${newProducts.length} товаров из XML файла`);
      
    } catch (error) {
      console.error('Ошибка при загрузке XML файла:', error);
      alert('Ошибка при загрузке файла. Проверьте формат XML.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return { color: 'text-red-400', bg: 'bg-red-900/20', text: t('products.lowStock') };
    if (stock <= 15) return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', text: t('products.mediumStock') };
    return { color: 'text-green-400', bg: 'bg-green-900/20', text: t('products.inStock') };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-glow-orange">
              {t('products.title')}
            </h1>
            
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover-glow-orange disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Загрузить XML
                  </>
                )}
              </button>
              
              <button className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover-glow-orange">
                <Plus size={20} />
                {t('products.addProduct')}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('products.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/60 backdrop-blur text-white pl-10 pr-4 py-3 rounded-lg border border-orange-500/30 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-full transition-all duration-200 neon-border-orange focus:glow-orange"
              />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-12 text-center neon-border-orange">
              <FileUp size={64} className="mx-auto mb-4 text-orange-400 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">База товаров пуста</h2>
              <p className="text-gray-400 mb-6">Загрузите XML файл с товарами для начала работы</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover-glow-orange"
              >
                <Upload size={20} className="inline mr-2" />
                Загрузить XML файл
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product: any) => {
                const stockStatus = getStockStatus(product.stock);
                
                return (
                  <div key={product.id} className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover-glow-orange neon-border-orange">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1 text-glow-orange">{product.name}</h3>
                        <span className="text-sm text-gray-400">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700/50 rounded transition-all duration-200">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-all duration-200">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-orange-400 text-glow-orange">{product.price}</div>
                      <div className={`px-3 py-1 rounded-full ${stockStatus.bg} border border-orange-500/20`}>
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock} шт.
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-2 rounded-lg ${stockStatus.bg} text-center border border-orange-500/20`}>
                      <span className={`text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
