
import { useState, useEffect } from "react";
import { Search, Bell, User, LogOut, LogIn } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthModal } from "./AuthModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TopBar = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Получаем текущего пользователя
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        loadProfile(user.id);
      }
    });

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "До свидания!",
        description: "Вы успешно вышли из системы",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-orange-500/20 px-6 py-4 shadow-lg shadow-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('common.search')}
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-orange-500/30 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-80 transition-all duration-200 neon-border-orange focus:glow-orange"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <button className="relative p-2 text-gray-400 hover:text-orange-400 transition-colors hover-glow-orange">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse-orange"></span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden md:block">
                  <span className="text-gray-300 text-sm">
                    {profile?.full_name || user.email}
                  </span>
                  <div className="text-xs text-orange-400">
                    {profile?.role === 'admin' ? 'Администратор' : 'Сотрудник'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Выйти"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover-glow-orange"
              >
                <LogIn size={16} />
                <span className="hidden md:inline">Войти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          toast({
            title: "Добро пожаловать!",
            description: "Вы успешно авторизовались в системе Апельсин",
          });
        }}
      />
    </>
  );
};
