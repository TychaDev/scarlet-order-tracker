
export interface Server {
  name: string;
  ip: string;
  status: "online" | "offline" | "maintenance";
  cpu: string;
  ram: string;
  storage: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  description: string;
}

export interface Order {
  id: string;
  customer: string;
  address: string;
  phone: string;
  products: string[];
  total: string;
  status: "pending" | "delivering" | "completed" | "cancelled";
  time: string;
}
