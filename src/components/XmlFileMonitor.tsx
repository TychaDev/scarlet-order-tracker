
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';

export const XmlFileMonitor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Загружаем время последней синхронизации
    const savedSync = localStorage.getItem('lastXmlSync');
    if (savedSync) {
      setLastSync(savedSync);
    }
  }, []);

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      console.log('Запуск ручной синхронизации XML файлов...');
      
      const result = await apiService.syncXmlFiles();
      
      console.log('Результат синхронизации:', result);
      
      const now = new Date().toLocaleString('ru-RU');
      setLastSync(now);
      localStorage.setItem('lastXmlSync', now);
      
      toast({
        title: "Синхронизация завершена",
        description: `Обработано файлов: ${result.processedFiles}`,
      });
      
      // Перезагружаем страницу для обновления списка товаров
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      console.error('Ошибка синхронизации:', error);
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось синхронизировать XML файлы",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={20} className="text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Мониторинг XML файлов</h3>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">
        Автоматическая синхронизация XML файлов из папки xml_upload каждые 2 часа
      </p>
      
      <div className="space-y-4">
        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle size={16} className="text-green-400" />
            <span>Последняя синхронизация: {lastSync}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock size={16} className="text-yellow-400" />
          <span>Следующая автосинхронизация через 2 часа</span>
        </div>
        
        <Button
          onClick={handleManualSync}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Синхронизация...
            </>
          ) : (
            <>
              <RefreshCw size={16} className="mr-2" />
              Запустить синхронизацию вручную
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
