
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Mail, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OwnerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OwnerSettings = ({ isOpen, onClose }: OwnerSettingsProps) => {
  const [step, setStep] = useState<'password' | 'settings'>('password');
  const [ownerPassword, setOwnerPassword] = useState("");
  const [settings, setSettings] = useState({
    managerName: "",
    managerEmail: "",
    newManagerPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setStep('password');
      setOwnerPassword("");
      setSettings({ managerName: "", managerEmail: "", newManagerPassword: "" });
    }
  }, [isOpen]);

  const handlePasswordCheck = async () => {
    if (ownerPassword === "8174126811dda") {
      setStep('settings');
      await loadCurrentManagerData();
    } else {
      toast({
        title: "Неверный пароль",
        description: "Введен неправильный пароль владельца",
        variant: "destructive",
      });
    }
  };

  const loadCurrentManagerData = async () => {
    try {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Получаем профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Ошибка загрузки профиля:', profileError);
        }

        setSettings({
          managerName: profile?.full_name || "",
          managerEmail: user.email || "",
          newManagerPassword: ""
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных менеджера:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные менеджера",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Пользователь не авторизован");
      }

      // Обновляем профиль пользователя
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: settings.managerName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Если указан новый пароль, обновляем его
      if (settings.newManagerPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: settings.newManagerPassword
        });
        
        if (passwordError) throw passwordError;
      }

      // Обновляем email если он изменился
      if (settings.managerEmail !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: settings.managerEmail
        });
        
        if (emailError) throw emailError;
      }

      toast({
        title: "Настройки сохранены",
        description: "Настройки менеджера успешно обновлены",
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
      <DialogContent className="modal-content-corporate max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gradient-orange-intense">
            {step === 'password' ? 'Доступ владельца' : 'Настройки менеджера'}
          </DialogTitle>
        </DialogHeader>

        {step === 'password' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerPassword" className="text-gray-300">
                Пароль владельца
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="ownerPassword"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  className="input-corporate pl-10"
                  placeholder="Введите пароль владельца"
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordCheck()}
                />
              </div>
            </div>

            <Button
              onClick={handlePasswordCheck}
              className="btn-corporate-primary w-full font-medium py-2 rounded-lg"
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
                  className="input-corporate pl-10"
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
                  className="input-corporate pl-10"
                  placeholder="Введите email менеджера"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newManagerPassword" className="text-gray-300">
                Новый пароль менеджера (оставьте пустым, чтобы не менять)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="newManagerPassword"
                  type="password"
                  value={settings.newManagerPassword}
                  onChange={(e) => setSettings({ ...settings, newManagerPassword: e.target.value })}
                  className="input-corporate pl-10"
                  placeholder="Новый пароль менеджера"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-corporate-primary w-full font-medium py-2 rounded-lg"
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
