
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
  price: number;
  stock_quantity: number;
  description: string;
  image_url?: string;
  custom_description?: string;
  xml_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: any[];
  total_amount?: number;
  payment_method?: 'halyk_bank' | 'kaspi_bank' | 'cash';
  status: "pending" | "processing" | "awaiting_courier" | "delivering" | "completed" | "cancelled";
  created_at: string;
  updated_at?: string;
  updated_status_at?: string;
}

export interface OrderHistory {
  id: string;
  original_order_id: string;
  order_number: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: any[];
  total_amount?: number;
  payment_method?: 'halyk_bank' | 'kaspi_bank' | 'cash';
  status?: string;
  created_at: string;
  completed_at: string;
  archived_reason?: string;
}
