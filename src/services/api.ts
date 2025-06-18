
import { apiEndpoints } from '@/config/database';
import { Product, Order, OrderHistory } from '@/types';

class ApiService {
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>(apiEndpoints.products);
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.request<Product>(apiEndpoints.products, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`${apiEndpoints.products}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`${apiEndpoints.products}/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>(apiEndpoints.orders);
  }

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    return this.request<Order>(apiEndpoints.orders, {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    return this.request<Order>(`${apiEndpoints.orders}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  // Order History
  async getOrderHistory(): Promise<OrderHistory[]> {
    return this.request<OrderHistory[]>(apiEndpoints.orderHistory);
  }

  // XML Sync
  async syncXmlFiles(): Promise<{ message: string; processedFiles: number }> {
    return this.request<{ message: string; processedFiles: number }>(apiEndpoints.xmlSync, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
