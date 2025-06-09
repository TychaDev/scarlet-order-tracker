
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Save, X } from 'lucide-react';

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

interface ProductEditorProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ProductEditor = ({ product, isOpen, onClose, onSave }: ProductEditorProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [customDescription, setCustomDescription] = useState(product?.custom_description || '');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ошибка",
          description: "Выберите файл изображения",
          variant: "destructive",
        });
        return;
      }
      
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImage(file);
    }
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Устанавливаем квадратные размеры 400x400 для оптимизации
        canvas.width = 400;
        canvas.height = 400;
        
        // Вычисляем размеры для центрирования изображения
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        
        // Рисуем изображение с обрезкой до квадрата
        ctx.drawImage(img, x, y, size, size, 0, 0, 400, 400);
        
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    if (!product) return;
    
    setIsUploading(true);
    try {
      let imageUrl = product.image_url;
      
      // Если выбрано новое изображение, загружаем его
      if (image) {
        const resizedImage = await resizeImage(image);
        const fileName = `${product.id}_${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, resizedImage);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Обновляем товар в базе данных
      const { error } = await supabase
        .from('products')
        .update({
          image_url: imageUrl,
          custom_description: customDescription
        })
        .eq('id', product.id);
        
      if (error) throw error;
      
      toast({
        title: "Успешно",
        description: "Товар обновлен",
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Ошибка сохранения:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сохранить товар",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-800 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Редактирование товара: {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Текущее изображение */}
          {product.image_url && (
            <div className="text-center">
              <p className="text-gray-300 mb-2">Текущее изображение:</p>
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-orange-500/30"
              />
            </div>
          )}
          
          {/* Загрузка нового изображения */}
          <div>
            <label className="block text-white font-medium mb-2">
              Загрузить новое изображение:
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-gray-700 border-orange-500/30 text-white"
              />
              {image && (
                <div className="flex items-center gap-2 text-green-400">
                  <Upload size={16} />
                  <span className="text-sm">{image.name}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Рекомендуется квадратное изображение. Будет автоматически обрезано до 400x400px.
            </p>
          </div>
          
          {/* Описание */}
          <div>
            <label className="block text-white font-medium mb-2">
              Дополнительное описание:
            </label>
            <Textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Введите подробное описание товара..."
              className="bg-gray-700 border-orange-500/30 text-white min-h-[120px]"
            />
          </div>
          
          {/* Информация о товаре */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Информация о товаре:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Категория:</span>
                <span className="text-white ml-2">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Цена:</span>
                <span className="text-white ml-2">₽{product.price?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Остаток:</span>
                <span className="text-white ml-2">{product.stock_quantity} шт.</span>
              </div>
            </div>
          </div>
          
          {/* Кнопки */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X size={16} className="mr-2" />
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUploading}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
