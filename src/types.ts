/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Main Course' | 'Breads' | 'Beverages' | 'Desserts';
  price: number;
  prepTime: number; // in minutes
  available: boolean;
  description: string;
  imageUrl?: string;
  rating?: 4 | 5;
  spicyLevel?: 0 | 1 | 2 | 3; // 0 = non-spicy, 3 = very spicy
  isVegan?: boolean;
}

export interface OrderItem {
  id: string; // unique identifier for the order item line (to distinguish same item with different orders)
  menuItemId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  status: 'Preparing' | 'Ready';
}

export type OrderStatus = 'Ordered' | 'Preparing' | 'Ready' | 'Served';

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  notes?: string;
  isPaid: boolean;
  paymentMethod?: 'Cash' | 'Card' | 'UPI';
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
}

export interface TableState {
  tableNumber: number;
  capacity: number;
  status: 'Available' | 'Occupied' | 'BillingPending';
  currentOrderId?: string;
}

export interface SystemTestResult {
  id: string;
  testInput: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'Pass' | 'Fail' | 'Pending';
  timestamp: string;
}
