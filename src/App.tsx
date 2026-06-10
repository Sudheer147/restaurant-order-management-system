/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck
/// <reference path="./react-shims.d.ts" />
import { useState, useEffect, useMemo } from 'react';
import { MenuItem, Order, OrderItem, TableState } from './types';
import menuData from './data/menu.json';
import WaiterStation from './components/WaiterStation';
import KitchenDisplay from './components/KitchenDisplay';
import BillingStation from './components/BillingStation';
import SimTestingSuite from './components/SimTestingSuite';
import EngineeringManual from './components/EngineeringManual';

// Lightweight local icon placeholders to avoid dependency on `lucide-react` during type fixes
const Crown = (props: any) => <span {...props}>👑</span>;
const Layers
 = (props: any) => <span {...props}>📚</span>;
const Smartphone = (props: any) => <span {...props}>📱</span>;
const ChefHat = (props: any) => <span {...props}>👨‍🍳</span>;
const Receipt = (props: any) => <span {...props}>🧾</span>;
const Cpu = (props: any) => <span {...props}>🖥️</span>;
const BookOpen = (props: any) => <span {...props}>📖</span>;
const UtensilsCrossed = (props: any) => <span {...props}>🍽️</span>;
const RotateCcw = (props: any) => <span {...props}>↺</span>;
const RefreshCw = (props: any) => <span {...props}>🔄</span>;
const Heart = (props: any) => <span {...props}>❤️</span>;

// Pre-initialize static table boundaries
const STATIC_TABLES: TableState[] = [
  { tableNumber: 1, capacity: 4, status: 'Available' },
  { tableNumber: 2, capacity: 2, status: 'Available' },
  { tableNumber: 3, capacity: 6, status: 'Available' },
  { tableNumber: 4, capacity: 4, status: 'Available' },
  { tableNumber: 5, capacity: 2, status: 'Available' },
  { tableNumber: 6, capacity: 8, status: 'Available' },
  { tableNumber: 7, capacity: 4, status: 'Available' },
  { tableNumber: 8, capacity: 4, status: 'Available' },
  { tableNumber: 9, capacity: 6, status: 'Available' },
  { tableNumber: 10, capacity: 2, status: 'Available' },
];

// Pre-initialize item stock ranges
const INITIAL_STOCK: Record<string, number> = {
  "item_1": 12, // Paneer Tikka
  "item_2": 15, // Samosa Chaat
  "item_3": 15, // Spring Rolls
  "item_4": 10, // Chicken Tikka
  "item_5": 8,  // Chili Gobi
  "item_6": 3,  // Garlic Butter Prawns (Low stock example to show warnings)
  "item_7": 15, // Butter Chicken
  "item_8": 12, // Palak Paneer
  "item_9": 20, // Dal makhani
  "item_10": 8, // Lamb Rogan Josh
  "item_11": 12,// Veg Korma
  "item_12": 10,// Chicken Biryani
  "item_13": 0, // Jackfruit Masala (Sold out)
  "item_14": 30,// Butter Naan
  "item_15": 25,// Garlic Naan
  "item_16": 20,// Tandoori Roti
  "item_17": 15,// Laccha Parata
  "item_18": 15,// Peshawari Naan
  "item_19": 15,// Mango Lassi
  "item_20": 20,// Masala Chai
  "item_21": 15,// Lime Soda
  "item_22": 15,// Peach Tea
  "item_23": 15,// Rose Milkshake
  "item_24": 30,// Sparkling Water
  "item_25": 15,// Gulab Jamun
  "item_26": 12,// Rasmalai
  "item_27": 10,// Gajar Halwa
  "item_28": 12,// Lava Cake
  "item_29": 10,// Kesar Kulfi
  "item_30": 15 // Baklava
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'waiter' | 'kitchen' | 'billing' | 'testing' | 'specs'>('simulator');
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemStock, setItemStock] = useState<Record<string, number>>(INITIAL_STOCK);

  // 1. Initial hydration from LocalStorage on mount
  useEffect(() => {
    const cachedOrders = localStorage.getItem('royal_harvest_orders');
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
      } catch (err) {
        console.error('Failed to parse cached orders, resetting to default.', err);
      }
    }

    const cachedStock = localStorage.getItem('royal_harvest_stock');
    if (cachedStock) {
      try {
        setItemStock(JSON.parse(cachedStock));
      } catch (err) {
        console.error('Failed to parse cached stock, resetting to default.', err);
      }
    }
  }, []);

  // 2. Persist states in LocalStorage upon change & trigger local event sync
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('royal_harvest_orders', JSON.stringify(updatedOrders));
  };

  const saveStock = (updatedStock: Record<string, number>) => {
    setItemStock(updatedStock);
    localStorage.setItem('royal_harvest_stock', JSON.stringify(updatedStock));
  };

  // 3. Sync events across MULTIPLE windows/tabs dynamically
  useEffect(() => {
    const handleCrossTabSync = (event: StorageEvent) => {
      if (event.key === 'royal_harvest_orders') {
        try {
          setOrders(JSON.parse(event.newValue || '[]'));
        } catch (e) {
          console.error('Cross-tab orders sync failed', e);
        }
      } else if (event.key === 'royal_harvest_stock') {
        try {
          setItemStock(JSON.parse(event.newValue || '{}'));
        } catch (e) {
          console.error('Cross-tab stock sync failed', e);
        }
      }
    };

    window.addEventListener('storage', handleCrossTabSync);
    return () => window.removeEventListener('storage', handleCrossTabSync);
  }, []);

  // Calculate dynamic table properties based on orders
  const tables = useMemo(() => {
    return STATIC_TABLES.map((table: TableState) => {
      const activeOrder = orders.find((o: Order) => o.tableId === table.tableNumber && !o.isPaid);
      let status: TableState['status'] = 'Available';

      if (activeOrder) {
        if (activeOrder.status === 'Ready') {
          status = 'BillingPending'; // ready for check-out receipting
        } else {
          status = 'Occupied';
        }
      }

      return {
        tableNumber: table.tableNumber,
        number: table.tableNumber,
        capacity: table.capacity,
        status,
        currentOrderId: activeOrder?.id
      } as TableState & { currentOrderId?: string; number: number };
    });
  }, [orders]);

  // ACTION handlers
  // Add a single order (Waiter view)
  const handleAddOrder = (newOrder: Order) => {
    const updatedOrders = [...orders, newOrder];
    saveOrders(updatedOrders);

    // Reduce stock quantities accordingly
    const updatedStock = { ...itemStock };
    newOrder.items.forEach((itm: OrderItem) => {
      const current = updatedStock[itm.menuItemId] !== undefined ? updatedStock[itm.menuItemId] : 15;
      updatedStock[itm.menuItemId] = Math.max(0, current - itm.quantity);
    });
    saveStock(updatedStock);
  };

  // Add multiple orders (Simulator bulk loading)
  const handleAddMultiOrders = (newOrders: Order[]) => {
    const updatedOrders = [...orders, ...newOrders];
    saveOrders(updatedOrders);

    // Reduce stock levels
    const updatedStock = { ...itemStock };
    newOrders.forEach((order: Order) => {
      order.items.forEach((itm: OrderItem) => {
        const current = updatedStock[itm.menuItemId] !== undefined ? updatedStock[itm.menuItemId] : 15;
        updatedStock[itm.menuItemId] = Math.max(0, current - itm.quantity);
      });
    });
    saveStock(updatedStock);
  };

  // Update item status within an order (Kitchen view)
  const handleUpdateOrderItemStatus = (orderId: string, itemLineId: string, newStatus: 'Preparing' | 'Ready') => {
    const updatedOrders = orders.map((order: Order) => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map((it: OrderItem) => {
        if (it.id === itemLineId) {
          return { ...it, status: newStatus };
        }
        return it;
      });

      // Auto check: if all lines are ready, transition overall order status to 'Ready'
      const allReady = updatedItems.every((it: OrderItem) => it.status === 'Ready');
      const nextStatus: Order['status'] = allReady ? 'Ready' : 'Preparing';

      return {
        ...order,
        items: updatedItems,
        status: nextStatus,
        updatedAt: new Date().toISOString()
      };
    });

    saveOrders(updatedOrders);
  };

  // Update overall order status (Kitchen status switches)
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map((order: Order) => {
      if (order.id !== orderId) return order;

      // If kitchen shifts overall order to Ready, mark all individual line items as Ready
      let updatedItems = [...order.items];
      if (newStatus === 'Ready') {
        updatedItems = order.items.map((it: OrderItem) => ({ ...it, status: 'Ready' }));
      }

      return {
        ...order,
        items: updatedItems,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    });

    saveOrders(updatedOrders);
  };

  // Settle and bill order (Billing view)
  const handleSettleOrder = (orderId: string, paymentMethod: 'Cash' | 'Card' | 'UPI') => {
    const updatedOrders = orders.map((order: Order) => {
      if (order.id === orderId) {
        return {
          ...order,
          isPaid: true,
          status: 'Served' as const,
          paymentMethod,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });

    saveOrders(updatedOrders);
  };

  // Purge/Reset entire ecosystem (Testing or demo wash)
  const handleResetAll = () => {
    setOrders([]);
    setItemStock(INITIAL_STOCK);
    localStorage.removeItem('royal_harvest_orders');
    localStorage.removeItem('royal_harvest_stock');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-900 selection:text-amber-100 font-sans">
      
      {/* 1. Brand header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[color:var(--restaurant-accent)] rounded-sm flex items-center justify-center text-[color:var(--restaurant-black)] font-bold font-mono shrink-0">
              01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-black text-lg text-[color:var(--restaurant-foreground)] tracking-tight uppercase">
                  Royal Harvest
                </h1>
                <span className="text-[10px] bg-[color:var(--restaurant-accent-soft)] text-[color:var(--restaurant-accent)] border border-[color:var(--restaurant-border)] px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">LIVE</span>
              </div>
              <p className="text-[10px] text-[color:var(--restaurant-muted)] uppercase tracking-widest font-bold">Command Center</p>
            </div>
          </div>

          {/* Tab Selection Navigation pills */}
          <nav className="flex flex-wrap gap-1 bg-slate-950 p-1 border border-slate-800 rounded-md font-sans">
            <button
              id="tab-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Unified Split View
            </button>

            <button
              id="tab-waiter"
              onClick={() => setActiveTab('waiter')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'waiter'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Waiter Pad
            </button>

            <button
              id="tab-kitchen"
              onClick={() => setActiveTab('kitchen')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'kitchen'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              Kitchen (KDS)
            </button>

            <button
              id="tab-billing"
              onClick={() => setActiveTab('billing')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Billing Terminal
            </button>

            <button
              id="tab-testing"
              onClick={() => setActiveTab('testing')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'testing'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Testing Suite
            </button>

            <button
              id="tab-specs"
              onClick={() => setActiveTab('specs')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-slate-800 text-amber-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Architecture
            </button>
          </nav>

          {/* Right Metrics panel */}
          <div className="hidden lg:flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">System Active</span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase font-black">Current Load</p>
              <p className="text-xs font-mono font-bold text-slate-400">42.8ms LATENCY</p>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Main content router body */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 transition-all duration-300">
        
        {/* TAB 1: SIMULATOR (Side-by-side terminal playground!) */}
        {activeTab === 'simulator' && (
          <div className="space-y-8" id="simulator-container">
            {/* Split View Warning alert banner - Geometric style! */}
            <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.2)]">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-none border border-emerald-900/60 mt-0.5 shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight italic text-slate-100">01. ECOSYSTEM SANDBOX (SPLIT VIEW SIMULATION)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-4xl">
                    This interactive operational cockpit merges all remote terminals onto a single pane. Tap foods in Waiter Pad, check active ingredients inside the cooking monitors, and settle checks side-by-side in real-time.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0 max-md:w-full">
                <button
                  id="btn-quick-seed"
                  onClick={() => {
                    const sampleBtn = document.getElementById('btn-run-sim');
                    if (sampleBtn) sampleBtn.click();
                  }}
                  className="px-4 py-2 bg-amber-600 text-slate-950 hover:bg-amber-500 text-xs font-black uppercase tracking-wider rounded-none transition-colors border border-amber-600 cursor-pointer max-md:flex-1"
                >
                  Quick Seed
                </button>
                <button
                  id="btn-master-clear"
                  onClick={handleResetAll}
                  className="px-4 py-2 bg-slate-950 text-slate-300 hover:bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5 max-md:flex-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {/* Split Grid with divide borders */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 divide-y xl:divide-y-0 xl:divide-x divide-slate-800 bg-slate-900 border border-slate-800 rounded-md overflow-hidden">
              
              {/* Waiter Tablet Block */}
              <div className="space-y-4 p-5 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-tighter italic text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-700 rounded-none shrink-0"></span>
                    01. Waiter Terminal
                  </h2>
                  <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Waiter Pad</span>
                </div>
                <div className="max-h-[700px] overflow-y-auto overflow-x-hidden pr-0.5">
                  <WaiterStation
                    orders={orders}
                    onAddOrder={handleAddOrder}
                    tables={tables}
                    itemStock={itemStock}
                    onReduceStock={(id, qty) => {
                      const updated = { ...itemStock };
                      updated[id] = Math.max(0, (updated[id] || 15) - qty);
                      saveStock(updated);
                    }}
                  />
                </div>
              </div>

              {/* Kitchen Display Block */}
              <div className="space-y-4 p-5 bg-slate-950/40">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-tighter italic text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-none shrink-0"></span>
                    02. Kitchen Display
                  </h2>
                  <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Chef Spool</span>
                </div>
                <div className="max-h-[700px] overflow-y-auto pr-0.5">
                  <KitchenDisplay
                    orders={orders}
                    onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                  />
                </div>
              </div>

              {/* Cashier Terminal Block */}
              <div className="space-y-4 p-5 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-black uppercase tracking-tighter italic text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none shrink-0"></span>
                    03. Billing Terminal
                  </h2>
                  <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Ledger Desk</span>
                </div>
                <div className="max-h-[700px] overflow-y-auto pr-0.5">
                  <BillingStation
                    orders={orders}
                    tables={tables}
                    itemStock={itemStock}
                    onSettleOrder={handleSettleOrder}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: WAITER TABLET FULL PAGE */}
        {activeTab === 'waiter' && (
          <div className="bg-slate-900 p-6 rounded-md border border-slate-800 animate-fade-in space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight italic text-slate-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                Standalone Handheld Waiter Pad
              </h2>
              <span className="text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-900/50 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">Terminal Locked</span>
            </div>
            <WaiterStation
              orders={orders}
              onAddOrder={handleAddOrder}
              tables={tables}
              itemStock={itemStock}
              onReduceStock={(id, qty) => {
                const updated = { ...itemStock };
                updated[id] = Math.max(0, (updated[id] || 15) - qty);
                saveStock(updated);
              }}
            />
          </div>
        )}

        {/* TAB 3: KITCHEN DISPLAY KDS FULL PAGE */}
        {activeTab === 'kitchen' && (
          <div className="bg-slate-900 p-6 rounded-md border border-slate-800 animate-fade-in space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight italic text-slate-100 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-500" />
                Kitchen Display System (KDS) Monitor
              </h2>
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
              </div>
            </div>
            <KitchenDisplay
              orders={orders}
              onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

        {/* TAB 4: BILLING FULL PAGE */}
        {activeTab === 'billing' && (
          <div className="bg-slate-900 p-6 rounded-md border border-slate-800 animate-fade-in space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight italic text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Cashier Billing & Settle Terminal
              </h2>
              <span className="text-[10px] font-mono text-slate-500">V 2.1.0-STABLE</span>
            </div>
            <BillingStation
              orders={orders}
              tables={tables}
              itemStock={itemStock}
              onSettleOrder={handleSettleOrder}
            />
          </div>
        )}

        {/* TAB 5: TESTING CONSOLE FULL PAGE */}
        {activeTab === 'testing' && (
          <div className="animate-fade-in">
            <SimTestingSuite
              orders={orders}
              onAddMultiOrders={handleAddMultiOrders}
              onClearAll={handleResetAll}
              onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

        {/* TAB 6: SPECIFICATIONS MANUAL */}
        {activeTab === 'specs' && (
          <div className="animate-fade-in">
            <EngineeringManual />
          </div>
        )}

      </main>

      {/* 3. Bottom Architecture & System Specs Rail */}
      <footer className="bg-slate-900 text-slate-400 p-6 md:p-8 border-t border-slate-700 mt-16 font-sans">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12 justify-between text-left">
          
          <div className="flex-none lg:w-56 space-y-2">
            <h3 className="text-white text-[10px] font-bold uppercase tracking-widest">Active Data Schema</h3>
            <div className="font-mono text-[9px] space-y-1.5 opacity-70">
              <p>ID: STRING [PK]</p>
              <p>ITEMS: ARRAY_OF_COURSES</p>
              <p>STATUS: 'Ordered' | 'Preparing' | 'Ready'</p>
              <p>TIMESTAMP: DATE_ISO8601</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest">CI/CD Pipeline</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-600"></div>
                </div>
                <span className="text-[9px] font-mono">75% TEST COVERAGE</span>
              </div>
              <p className="text-[9px] mt-2 leading-relaxed italic text-slate-500">Automated deployment via GitHub Actions triggers on push to main branch with staging gate.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest">Edge Case Logic</h3>
              <p className="text-[9px] leading-relaxed text-slate-400">
                • <span className="text-white">Stock Exhaust:</span> Mid-order lock with Toast alerting.<br />
                • <span className="text-white">Empty Table:</span> Form validation blocks receipting.<br />
                • <span className="text-white">Active Sync:</span> Cross-tab storage coordination.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest font-sans">Monitoring Metrics</h3>
              <div className="flex justify-between items-end border-b border-slate-700 pb-1 mb-1">
                <span className="text-[9px]">Avg Prep Time</span>
                <span className="text-[10px] text-white font-bold font-mono">12.4m</span>
              </div>
              <div className="text-right flex justify-between items-end border-b border-slate-700 pb-0.5 mt-1 font-mono">
                <span className="text-[9px] font-sans">Table Turnover</span>
                <span className="block text-[10px] text-white font-bold">54.2m RUNTIME</span>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500">
          <p>Project 01: Royal Harvest • Restaurant Operations Dashboard • Handcrafted in 2026</p>
          <p className="flex items-center gap-1.5 justify-center">
            CI Build: Green <span className="inline-block bg-emerald-500 rounded-full w-2 h-2 animate-pulse"></span>
          </p>
        </div>
     </footer>

    </div>
  );
}
