
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'kz', name: 'Қазақша', flag: '🇰🇿' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 text-gray-400 hover:text-orange-400 transition-colors hover-glow-orange">
        <Globe size={20} />
        <span className="text-sm">{languages.find(l => l.code === language)?.flag}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-orange-500/30 rounded-lg shadow-lg shadow-orange-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 neon-border-orange">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors w-full text-left ${
              language === lang.code ? 'text-orange-400' : 'text-gray-300'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
