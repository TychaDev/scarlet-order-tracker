
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface ProductSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories: string[];
}

export interface SearchFilters {
  searchText: string;
  category: string;
  stockFilter: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const ProductSearch = ({ onSearch, categories }: ProductSearchProps) => {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<SearchFilters['stockFilter']>('all');

  const handleSearch = () => {
    onSearch({
      searchText,
      category,
      stockFilter
    });
  };

  const handleClear = () => {
    setSearchText('');
    setCategory('all');
    setStockFilter('all');
    onSearch({
      searchText: '',
      category: 'all',
      stockFilter: 'all'
    });
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Search size={20} className="text-orange-400" />
        Поиск товаров
      </h3>
      
      <div className="grid md:grid-cols-4 gap-4">
        {/* Поиск по названию */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Поиск по названию:
          </label>
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Введите название товара..."
            className="bg-gray-700 border-orange-500/30 text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        {/* Категория */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Категория:
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-gray-700 border-orange-500/30 text-white">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-orange-500/30">
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Остатки */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            По остаткам:
          </label>
          <Select value={stockFilter} onValueChange={(value: SearchFilters['stockFilter']) => setStockFilter(value)}>
            <SelectTrigger className="bg-gray-700 border-orange-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-orange-500/30">
              <SelectItem value="all">Все товары</SelectItem>
              <SelectItem value="in_stock">В наличии (&gt;10)</SelectItem>
              <SelectItem value="low_stock">Заканчиваются (1-10)</SelectItem>
              <SelectItem value="out_of_stock">Нет в наличии (0)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Кнопки */}
        <div className="flex items-end gap-2">
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 flex-1"
          >
            <Search size={16} className="mr-2" />
            Найти
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
