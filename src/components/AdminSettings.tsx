
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Mail, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettings = ({ isOpen, onClose }: AdminSettingsProps) => {
  const [step, setStep] = useState<'password' | 'settings'>('password');
  const [adminPassword, setAdminPassword] = useState("");
  const [settings, setSettings] = useState({
    managerName: "",
    managerEmail: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('password');
      setAdminPassword("");
      setSettings({ managerName: "", managerEmail: "", newPassword: "" });
    }
  }, [isOpen]);

  const handlePasswordCheck = async () => {
    if (adminPassword === "8174126811dda") {
      setStep('settings');
      // Загружаем текущие настройки
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('manager_name, manager_email')
          .single();

        if (data && !error) {
          setSettings({
            managerName: data.manager_name || "",
            managerEmail: data.manager_email || "",
            newPassword: ""
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    } else {
      toast({
        title: "Неверный пароль",
        description: "Введен неправильный пароль администратора",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        manager_name: settings.managerName,
        manager_email: settings.managerEmail,
        updated_at: new Date().toISOString()
      };

      if (settings.newPassword) {
        updateData.admin_password_hash = settings.newPassword;
      }

      const { error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('admin_password_hash', '8174126811dda');

      if (error) throw error;

      toast({
        title: "Настройки сохранены",
        description: "Настройки администратора успешно обновлены",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-glow-orange-intense">
            {step === 'password' ? 'Доступ администратора' : 'Настройки'}
          </DialogTitle>
        </DialogHeader>

        {step === 'password' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-gray-300">
                Пароль администратора
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="pl-10 bg-gray-800/60 border-orange-500/30 focus:border-orange-500 text-white"
                  placeholder="Введите пароль администратора"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordCheck()}
                />
              </div>
            </div>

            <Button
              onClick={handlePasswordCheck}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-medium py-2 rounded-lg transition-all duration-200 hover-glow-orange"
            >
              Войти
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="managerName" className="text-gray-300">
                Имя менеджера
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="managerName"
                  type="text"
                  value={settings.managerName}
                  onChange={(e) => setSettings({ ...settings, managerName: e.target.value })}
                  className="pl-10 bg-gray-800/60 border-orange-500/30 focus:border-orange-500 text-white"
                  placeholder="Введите имя менеджера"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerEmail" className="text-gray-300">
                Email менеджера
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="managerEmail"
                  type="email"
                  value={settings.managerEmail}
                  onChange={(e) => setSettings({ ...settings, managerEmail: e.target.value })}
                  className="pl-10 bg-gray-800/60 border-orange-500/30 focus:border-orange-500 text-white"
                  placeholder="Введите email менеджера"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                Новый пароль администратора (оставьте пустым, чтобы не менять)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="newPassword"
                  type="password"
                  value={settings.newPassword}
                  onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                  className="pl-10 bg-gray-800/60 border-orange-500/30 focus:border-orange-500 text-white"
                  placeholder="Новый пароль"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-medium py-2 rounded-lg transition-all duration-200 hover-glow-orange"
            >
              {loading ? (
                "Сохранение..."
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
