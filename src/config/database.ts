
export const dbConfig = {
  host: 'clouds.desanta.ru',
  port: 3306,
  database: 's9_apelsin',
  username: 'u9_Ry5YvUhBuJ',
  password: 'sq0EnaGT@BaUIpaHcD7z..N3'
};

// API endpoints для работы с данными
export const API_BASE_URL = '/api';

export const apiEndpoints = {
  products: `${API_BASE_URL}/products`,
  orders: `${API_BASE_URL}/orders`,
  orderHistory: `${API_BASE_URL}/order-history`,
  systemSettings: `${API_BASE_URL}/system-settings`,
  xmlSync: `${API_BASE_URL}/xml-sync`
};
