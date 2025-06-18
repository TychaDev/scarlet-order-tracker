import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { XmlFileMonitor } from "@/components/XmlFileMonitor";
import { ProductEditor } from "@/components/ProductEditor";
import { ProductSearch, SearchFilters } from "@/components/ProductSearch";
import { OrderHistory } from "@/components/OrderHistory";
import { Package, Edit, History, Image } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  description: string;
  image_url?: string;
  custom_description?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Загружаем товары из API...');
      const data = await apiService.getProducts();
      
      console.log('Получено товаров:', data.length);
      setProducts(data);
      setFilteredProducts(data);
    } catch (error: any) {
      console.error('Ошибка загрузки товаров:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить товары: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...products];

    // Фильтр по тексту
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.custom_description?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по категории
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Фильтр по остаткам
    if (filters.stockFilter !== 'all') {
      switch (filters.stockFilter) {
        case 'in_stock':
          filtered = filtered.filter(product => (product.stock_quantity || 0) > 10);
          break;
        case 'low_stock':
          filtered = filtered.filter(product => {
            const stock = product.stock_quantity || 0;
            return stock >= 1 && stock <= 10;
          });
          break;
        case 'out_of_stock':
          filtered = filtered.filter(product => (product.stock_quantity || 0) === 0);
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const openEditor = (product: Product) => {
    setSelectedProduct(product);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setSelectedProduct(null);
    setIsEditorOpen(false);
  };

  const handleProductSaved = () => {
    loadProducts();
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Нет в наличии', color: 'text-red-400' };
    if (quantity <= 10) return { text: 'Заканчивается', color: 'text-yellow-400' };
    return { text: 'В наличии', color: 'text-green-400' };
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка товаров...</p>
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
              {t('products.title')}
            </h1>
            
            <Button
              onClick={() => setIsHistoryOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
            >
              <History size={16} className="mr-2" />
              История заказов
            </Button>
          </div>

          <div className="space-y-6">
            {/* XML Мониторинг */}
            <XmlFileMonitor />
            
            {/* Поиск товаров */}
            <ProductSearch 
              onSearch={handleSearch}
              categories={categories}
            />

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-orange-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Всего товаров</p>
                    <p className="text-white text-xl font-bold">{products.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">В наличии</p>
                    <p className="text-white text-xl font-bold">
                      {products.filter(p => (p.stock_quantity || 0) > 10).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Заканчиваются</p>
                    <p className="text-white text-xl font-bold">
                      {products.filter(p => {
                        const stock = p.stock_quantity || 0;
                        return stock >= 1 && stock <= 10;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/60 backdrop-blur rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <Package size={24} className="text-red-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Нет в наличии</p>
                    <p className="text-white text-xl font-bold">
                      {products.filter(p => (p.stock_quantity || 0) === 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Таблица товаров */}
            <div className="bg-gray-800/60 backdrop-blur rounded-xl border border-orange-500/20 overflow-hidden">
              <div className="p-4 border-b border-orange-500/20">
                <h3 className="text-white text-lg font-semibold">
                  Найдено товаров: {filteredProducts.length}
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-orange-500/20 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">Изображение</TableHead>
                      <TableHead className="text-gray-300">Название</TableHead>
                      <TableHead className="text-gray-300">Категория</TableHead>
                      <TableHead className="text-gray-300">Цена</TableHead>
                      <TableHead className="text-gray-300">Остаток</TableHead>
                      <TableHead className="text-gray-300">Статус</TableHead>
                      <TableHead className="text-gray-300">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock_quantity || 0);
                      return (
                        <TableRow key={product.id} className="border-orange-500/10 hover:bg-gray-700/30">
                          <TableCell>
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-orange-500/30">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <Image size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{product.name}</p>
                              {product.custom_description && (
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                  {product.custom_description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{product.category || 'Без категории'}</TableCell>
                          <TableCell className="text-orange-400 font-semibold">
                            {product.price?.toLocaleString()} ₸
                          </TableCell>
                          <TableCell className="text-white">{product.stock_quantity || 0} шт.</TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => openEditor(product)}
                              size="sm"
                              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
                            >
                              <Edit size={14} className="mr-1" />
                              Редактировать
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Модальные окна */}
      <ProductEditor
        product={selectedProduct}
        isOpen={isEditorOpen}
        onClose={closeEditor}
        onSave={handleProductSaved}
      />
      
      <OrderHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default Products;
