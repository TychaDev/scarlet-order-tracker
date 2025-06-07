
import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Edit, Trash2, Search, Upload, FileUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Ошибка загрузки товаров:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите XML файл",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      
      // Парсим предложения из XML в формате вашего каталога
      const offers = xmlDoc.getElementsByTagName('offer');
      const newProducts = [];
      
      console.log('Найдено предложений в XML:', offers.length);
      
      for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];
        
        // Извлекаем данные из атрибутов и элементов
        const sku = offer.getAttribute('sku') || '';
        const group1 = offer.getAttribute('group1') || 'Без категории';
        const group2 = offer.getAttribute('group2') || '';
        
        const nameElement = offer.getElementsByTagName('name')[0];
        const ostatokElement = offer.getElementsByTagName('ostatok')[0];
        const priceElement = offer.getElementsByTagName('price')[0];
        
        const name = nameElement?.textContent || 'Неизвестный товар';
        const ostatokText = ostatokElement?.textContent || '0';
        const priceText = priceElement?.textContent || '0';
        
        // Обработка остатка (может быть пустым или с запятой)
        let stockQuantity = 0;
        if (ostatokText && ostatokText.trim()) {
          stockQuantity = Math.floor(parseFloat(ostatokText.replace(',', '.')) || 0);
        }
        
        // Обработка цены (убираем пробелы)
        const price = parseFloat(priceText.replace(/\s/g, '').replace(',', '.')) || 0;
        
        const productData = {
          name: name,
          category: group2 || group1,
          price: price,
          stock_quantity: stockQuantity,
          description: `SKU: ${sku}${group1 ? ` | Группа: ${group1}` : ''}${group2 ? ` | Подгруппа: ${group2}` : ''}`,
          xml_data: {
            sku: sku,
            group1: group1,
            group2: group2,
            original_ostatok: ostatokText,
            original_price: priceText,
            raw_data: offer.outerHTML
          }
        };
        
        console.log('Обработан товар:', productData);
        
        // Сохраняем товар в базу данных
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (!error && data) {
          newProducts.push(data);
        } else {
          console.error('Ошибка при сохранении товара:', error);
        }
      }
      
      await loadProducts(); // Перезагружаем все товары
      
      toast({
        title: "Успешно!",
        description: `Загружено ${newProducts.length} товаров из XML файла`,
      });
      
    } catch (error: any) {
      console.error('Ошибка при загрузке XML файла:', error);
      toast({
        title: "Ошибка",
        description: "Ошибка при загрузке файла. Проверьте формат XML.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Сбрасываем значение input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProducts();
      toast({
        title: "Успешно!",
        description: "Товар удален",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар",
        variant: "destructive",
      });
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
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
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
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 disabled:opacity-50"
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
                className="bg-gray-800/60 backdrop-blur text-white pl-10 pr-4 py-3 rounded-lg border border-orange-500/30 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-full transition-all duration-200"
              />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur border border-orange-500/20 rounded-xl p-12 text-center">
              <FileUp size={64} className="mx-auto mb-4 text-orange-400 opacity-50" />
              <h2 className="text-xl font-semibold text-white mb-2">База товаров пуста</h2>
              <p className="text-gray-400 mb-6">Загрузите XML файл с товарами для начала работы</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30"
              >
                <Upload size={20} className="inline mr-2" />
                Загрузить XML файл
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product: any) => {
                const stockStatus = getStockStatus(product.stock_quantity || 0);
                
                return (
                  <div key={product.id} className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                        <span className="text-sm text-gray-400">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-700/50 rounded transition-all duration-200">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-orange-400">
                        ₽{product.price?.toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${stockStatus.bg} border border-orange-500/20`}>
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock_quantity || 0} шт.
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
