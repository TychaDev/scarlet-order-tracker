
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText } from 'lucide-react';

export const XmlUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')) {
        setSelectedFile(file);
        console.log('XML файл выбран:', file.name, 'размер:', file.size);
      } else {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, выберите XML файл",
          variant: "destructive",
        });
      }
    }
  };

  const processXmlFile = async (xmlContent: string, fileName: string) => {
    try {
      console.log('Начинаем обработку XML файла:', fileName);
      console.log('Содержимое XML (первые 500 символов):', xmlContent.substring(0, 500));
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        console.error('Ошибка парсинга XML:', parserError.textContent);
        throw new Error('Ошибка парсинга XML: ' + parserError.textContent);
      }
      
      const offers = xmlDoc.getElementsByTagName('offer');
      console.log('Найдено предложений в XML:', offers.length);
      
      if (offers.length === 0) {
        // Попробуем найти другие возможные элементы
        const products = xmlDoc.getElementsByTagName('product');
        const items = xmlDoc.getElementsByTagName('item');
        console.log('Альтернативные элементы - products:', products.length, 'items:', items.length);
        
        if (products.length === 0 && items.length === 0) {
          throw new Error('В XML файле не найдено товаров. Проверьте структуру файла.');
        }
      }
      
      const newProducts = [];
      
      for (let i = 0; i < offers.length; i++) {
        const offer = offers[i];
        
        const sku = offer.getAttribute('sku') || offer.getAttribute('id') || '';
        const group1 = offer.getAttribute('group1') || offer.getAttribute('category') || 'Без категории';
        const group2 = offer.getAttribute('group2') || offer.getAttribute('subcategory') || '';
        
        const nameElement = offer.getElementsByTagName('name')[0] || offer.getElementsByTagName('title')[0];
        const ostatokElement = offer.getElementsByTagName('ostatok')[0] || offer.getElementsByTagName('quantity')[0] || offer.getElementsByTagName('stock')[0];
        const priceElement = offer.getElementsByTagName('price')[0] || offer.getElementsByTagName('cost')[0];
        
        const name = nameElement?.textContent || 'Неизвестный товар';
        const ostatokText = ostatokElement?.textContent || '0';
        const priceText = priceElement?.textContent || '0';
        
        console.log(`Товар ${i + 1}:`, {
          name,
          sku,
          group1,
          group2,
          ostatokText,
          priceText
        });
        
        let stockQuantity = 0;
        if (ostatokText && ostatokText.trim()) {
          stockQuantity = Math.floor(parseFloat(ostatokText.replace(',', '.')) || 0);
        }
        
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
            imported_from: fileName,
            imported_at: new Date().toISOString()
          }
        };
        
        newProducts.push(productData);
      }
      
      console.log('Подготовлено товаров для сохранения:', newProducts.length);
      
      // Проверим подключение к базе данных
      const { data: testConnection, error: connectionError } = await supabase
        .from('products')
        .select('count(*)')
        .limit(1);
      
      if (connectionError) {
        console.error('Ошибка подключения к базе данных:', connectionError);
        throw new Error('Ошибка подключения к базе данных: ' + connectionError.message);
      }
      
      console.log('Подключение к базе данных успешно');
      
      // Сохраняем товары в базу данных пачками
      if (newProducts.length > 0) {
        const batchSize = 100;
        let totalSaved = 0;
        
        for (let i = 0; i < newProducts.length; i += batchSize) {
          const batch = newProducts.slice(i, i + batchSize);
          console.log(`Сохраняем пачку ${Math.floor(i / batchSize) + 1}: товары ${i + 1}-${Math.min(i + batchSize, newProducts.length)}`);
          
          const { data, error } = await supabase
            .from('products')
            .insert(batch)
            .select();
          
          if (error) {
            console.error('Ошибка при сохранении пачки товаров:', error);
            console.error('Детали ошибки:', error.details, error.hint, error.code);
            throw error;
          } else {
            totalSaved += batch.length;
            console.log(`Успешно сохранена пачка товаров: ${batch.length}, всего сохранено: ${totalSaved}`);
            console.log('Ответ от базы данных:', data);
          }
        }
        
        return totalSaved;
      }
      
      return 0;
    } catch (error) {
      console.error('Ошибка обработки XML:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите XML файл",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Начинаем загрузку файла:', selectedFile.name);
      const xmlContent = await selectedFile.text();
      console.log('Файл прочитан, размер содержимого:', xmlContent.length);
      
      const savedCount = await processXmlFile(xmlContent, selectedFile.name);
      
      console.log('Загрузка завершена, сохранено товаров:', savedCount);
      
      toast({
        title: "Успешно загружено",
        description: `Обработано и сохранено товаров: ${savedCount}`,
      });
      
      setSelectedFile(null);
      
      // Перезагружаем страницу для обновления списка товаров
      console.log('Перезагружаем страницу через 1 секунду...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Ошибка загрузки XML:', error);
      toast({
        title: "Ошибка загрузки",
        description: error.message || "Не удалось обработать XML файл",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-green-500/20">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} className="text-green-400" />
        <h3 className="text-lg font-semibold text-white">Загрузка XML файлов</h3>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">
        Загрузите XML файл из 1С для импорта товаров в базу данных
      </p>
      
      <div className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".xml"
            onChange={handleFileSelect}
            className="bg-gray-700 border-green-500/30 text-white file:bg-green-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1"
          />
          {selectedFile && (
            <p className="text-green-400 text-sm mt-2">
              Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} КБ)
            </p>
          )}
        </div>
        
        <Button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white w-full"
        >
          {isUploading ? (
            <>
              <Upload size={16} className="mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              Загрузить XML файл
            </Button>
          )}
        </Button>
      </div>
    </div>
  );
};
