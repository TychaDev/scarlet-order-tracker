
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Monitor, RefreshCw } from 'lucide-react';

export const FtpMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const checkForNewFiles = async () => {
    setIsMonitoring(true);
    try {
      console.log('Запускаем проверку FTP папки...');
      
      const { data, error } = await supabase.functions.invoke('xml-file-monitor', {
        method: 'POST'
      });

      if (error) {
        console.error('Ошибка при вызове функции:', error);
        throw error;
      }

      console.log('Ответ от функции мониторинга:', data);

      if (data?.success) {
        toast({
          title: "Проверка завершена",
          description: data.message || "FTP папка проверена успешно",
        });
        
        // Если файлы были обработаны, перезагружаем страницу для обновления списка товаров
        if (data.filesProcessed > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        throw new Error(data?.error || 'Неизвестная ошибка при проверке FTP папки');
      }
    } catch (error: any) {
      console.error('Ошибка при проверке FTP папки:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось проверить FTP папку",
        variant: "destructive",
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800/60 backdrop-blur rounded-xl border border-orange-500/20">
      <div className="flex items-center gap-2">
        <Monitor size={20} className="text-orange-400" />
        <h3 className="text-lg font-semibold text-white">FTP Мониторинг</h3>
      </div>
      
      <p className="text-gray-300 text-sm">
        Проверить FTP папку на наличие новых XML файлов и автоматически загрузить товары
      </p>
      
      <Button
        onClick={checkForNewFiles}
        disabled={isMonitoring}
        className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
      >
        {isMonitoring ? (
          <>
            <RefreshCw size={16} className="mr-2 animate-spin" />
            Проверка...
          </>
        ) : (
          <>
            <Monitor size={16} className="mr-2" />
            Проверить FTP папку
          </>
        )}
      </Button>
    </div>
  );
};
