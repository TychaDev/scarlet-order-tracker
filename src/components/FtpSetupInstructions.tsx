
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Server, Terminal, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FtpSetupInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FtpSetupInstructions = ({ isOpen, onClose }: FtpSetupInstructionsProps) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, commandName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(commandName);
    toast({
      title: "Скопировано!",
      description: `Команда ${commandName} скопирована в буфер обмена`,
    });
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const commands = [
    {
      name: "Установка vsftpd",
      command: "sudo apt update && sudo apt install vsftpd -y"
    },
    {
      name: "Создание пользователя",
      command: "sudo useradd -m -s /bin/bash ftpmanager && sudo passwd ftpmanager"
    },
    {
      name: "Создание папки",
      command: "sudo mkdir -p /home/ftpmanager/xml_upload && sudo chown ftpmanager:ftpmanager /home/ftpmanager/xml_upload"
    },
    {
      name: "Настройка vsftpd",
      command: `sudo cp /etc/vsftpd.conf /etc/vsftpd.conf.backup
sudo tee /etc/vsftpd.conf > /dev/null << 'EOF'
listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES
chroot_local_user=YES
secure_chroot_dir=/var/run/vsftpd/empty
pam_service_name=vsftpd
rsa_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
rsa_private_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
ssl_enable=NO
allow_writeable_chroot=YES
port_enable=YES
connect_from_port_20=YES
ftp_data_port=20
listen_port=21
pasv_enable=YES
pasv_min_port=10000
pasv_max_port=10100
user_sub_token=$USER
local_root=/home/$USER
EOF`
    },
    {
      name: "Перезапуск сервиса",
      command: "sudo systemctl restart vsftpd && sudo systemctl enable vsftpd"
    },
    {
      name: "Настройка брандмауэра",
      command: "sudo ufw allow 21/tcp && sudo ufw allow 10000:10100/tcp"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-800 border-orange-500/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Server size={24} className="text-orange-400" />
            Настройка FTP сервера (порт 21)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Важно:</strong> Эти команды нужно выполнить на вашем сервере с правами администратора.
              После настройки вы сможете подключаться к FTP по порту 21.
            </p>
          </div>
          
          <div className="space-y-4">
            {commands.map((cmd, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Terminal size={16} className="text-orange-400" />
                    {index + 1}. {cmd.name}
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(cmd.command, cmd.name)}
                    className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    {copiedCommand === cmd.name ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </div>
                <pre className="text-gray-300 text-sm bg-gray-900/50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                  {cmd.command}
                </pre>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-300 font-medium mb-2">Настройки для подключения из 1С:</h4>
            <div className="text-sm text-blue-200 space-y-1">
              <p><strong>FTP Сервер:</strong> IP вашего сервера</p>
              <p><strong>Порт:</strong> 21</p>
              <p><strong>Пользователь:</strong> ftpmanager</p>
              <p><strong>Пароль:</strong> тот, который вы установили</p>
              <p><strong>Папка загрузки:</strong> /xml_upload</p>
              <p><strong>Режим:</strong> Активный (Active Mode)</p>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-300 font-medium mb-2">Проверка подключения:</h4>
            <div className="text-sm text-green-200">
              <p>Для проверки подключения используйте любой FTP клиент:</p>
              <code className="bg-gray-900/50 px-2 py-1 rounded">
                ftp IP_ВАШЕГО_СЕРВЕРА 21
              </code>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
            >
              Понятно
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
