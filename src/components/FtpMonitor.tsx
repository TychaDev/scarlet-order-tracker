
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Monitor, RefreshCw, Server, Database, AlertTriangle } from 'lucide-react';
import { XmlUploader } from './XmlUploader';

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
          title: "Информация о мониторинге",
          description: data.message || "FTP мониторинг настроен",
        });
      } else {
        throw new Error(data?.error || 'Неизвестная ошибка при проверке FTP папки');
      }
    } catch (error: any) {
      console.error('Ошибка при проверке FTP папки:', error);
      toast({
        title: "Информация",
        description: "FTP мониторинг требует дополнительной настройки сервера. Используйте загрузку XML файлов ниже.",
        variant: "default",
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* XML Загрузчик */}
      <XmlUploader />
      
      {/* FTP мониторинг */}
      <div className="bg-gray-800/60 backdrop-blur rounded-xl p-6 border border-orange-500/20">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={20} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">FTP Мониторинг</h3>
            </div>
            
            <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-300 text-sm">
                <strong>Внимание:</strong> FTP мониторинг требует дополнительной настройки сервера. 
                Используйте загрузку XML файлов выше для импорта товаров.
              </p>
            </div>
            
            <Button
              onClick={checkForNewFiles}
              disabled={isMonitoring}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white w-full"
            >
              {isMonitoring ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Monitor size={16} className="mr-2" />
                  Информация о мониторинге
                </>
              )}
            </Button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server size={20} className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Интеграция с 1С</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-300 mb-2">
                  <strong className="text-white">Настройки FTP для 1С:</strong>
                </p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Хост: IP вашего сервера</li>
                  <li>• Порт: 21</li>
                  <li>• Папка: /home/ftpmanager/xml_upload</li>
                  <li>• Формат файлов: XML</li>
                </ul>
              </div>
              
              <div className="flex items-center gap-2 text-blue-400">
                <Database size={16} />
                <span className="text-sm">Рекомендуется: загрузка XML файлов через веб-интерфейс</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
