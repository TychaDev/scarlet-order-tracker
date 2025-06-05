
import React, { createContext, useContext, useState } from 'react';

type Language = 'ru' | 'en' | 'kz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ru: {
    // Navigation
    'nav.dashboard': 'Дашборд',
    'nav.products': 'Товары',
    'nav.orders': 'Заказы',
    'nav.settings': 'Настройки',
    
    // Dashboard
    'dashboard.title': 'Панель управления доставкой',
    'dashboard.totalOrders': 'Всего заказов',
    'dashboard.totalProducts': 'Всего товаров',
    'dashboard.totalRevenue': 'Общий доход',
    'dashboard.activeDeliveries': 'Активные доставки',
    'dashboard.recentOrders': 'Последние заказы',
    'dashboard.viewAll': 'Посмотреть все',
    
    // Products
    'products.title': 'Управление товарами',
    'products.addProduct': 'Добавить товар',
    'products.search': 'Поиск товаров...',
    'products.lowStock': 'Низкий остаток',
    'products.mediumStock': 'Средний остаток',
    'products.inStock': 'В наличии',
    
    // Orders
    'orders.title': 'Управление заказами',
    'orders.allOrders': 'Все заказы',
    'orders.pending': 'Ожидание',
    'orders.delivering': 'Доставляется',
    'orders.completed': 'Завершен',
    'orders.cancelled': 'Отменен',
    'orders.customer': 'Клиент',
    'orders.deliveryAddress': 'Адрес доставки',
    'orders.products': 'Товары',
    'orders.details': 'Подробнее',
    
    // Common
    'common.search': 'Поиск...',
    'common.filter': 'Фильтр',
    'common.admin': 'Админ',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Delivery Management Panel',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.totalProducts': 'Total Products',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.activeDeliveries': 'Active Deliveries',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.viewAll': 'View All',
    
    // Products
    'products.title': 'Product Management',
    'products.addProduct': 'Add Product',
    'products.search': 'Search products...',
    'products.lowStock': 'Low Stock',
    'products.mediumStock': 'Medium Stock',
    'products.inStock': 'In Stock',
    
    // Orders
    'orders.title': 'Order Management',
    'orders.allOrders': 'All Orders',
    'orders.pending': 'Pending',
    'orders.delivering': 'Delivering',
    'orders.completed': 'Completed',
    'orders.cancelled': 'Cancelled',
    'orders.customer': 'Customer',
    'orders.deliveryAddress': 'Delivery Address',
    'orders.products': 'Products',
    'orders.details': 'Details',
    
    // Common
    'common.search': 'Search...',
    'common.filter': 'Filter',
    'common.admin': 'Admin',
  },
  kz: {
    // Navigation
    'nav.dashboard': 'Басқару панелі',
    'nav.products': 'Өнімдер',
    'nav.orders': 'Тапсырыстар',
    'nav.settings': 'Баптаулар',
    
    // Dashboard
    'dashboard.title': 'Жеткізу басқару панелі',
    'dashboard.totalOrders': 'Барлық тапсырыстар',
    'dashboard.totalProducts': 'Барлық өнімдер',
    'dashboard.totalRevenue': 'Жалпы кіріс',
    'dashboard.activeDeliveries': 'Белсенді жеткізулер',
    'dashboard.recentOrders': 'Соңғы тапсырыстар',
    'dashboard.viewAll': 'Барлығын көру',
    
    // Products
    'products.title': 'Өнімдерді басқару',
    'products.addProduct': 'Өнім қосу',
    'products.search': 'Өнімдерді іздеу...',
    'products.lowStock': 'Аз қор',
    'products.mediumStock': 'Орта қор',
    'products.inStock': 'Қорда бар',
    
    // Orders
    'orders.title': 'Тапсырыстарды басқару',
    'orders.allOrders': 'Барлық тапсырыстар',
    'orders.pending': 'Күту',
    'orders.delivering': 'Жеткізілуде',
    'orders.completed': 'Аяқталды',
    'orders.cancelled': 'Бас тартылды',
    'orders.customer': 'Тұтынушы',
    'orders.deliveryAddress': 'Жеткізу мекенжайы',
    'orders.products': 'Өнімдер',
    'orders.details': 'Толығырақ',
    
    // Common
    'common.search': 'Іздеу...',
    'common.filter': 'Сүзгі',
    'common.admin': 'Админ',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
