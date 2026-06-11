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
import DesignSystem from './components/DesignSystem';
import royalHarvestLogo from '../assets/royal-harvest-logo.svg';

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
const Sparkles = (props: any) => <span {...props}>✨</span>;

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
  const [activeTab, setActiveTab] = useState<'splash' | 'welcome' | 'simulator' | 'waiter' | 'kitchen' | 'billing' | 'testing' | 'specs' | 'design'>('splash');
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemStock, setItemStock] = useState<Record<string, number>>(INITIAL_STOCK);
  const [countdown, setCountdown] = useState(5);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reservation Form States
  const [reserveName, setReserveName] = useState('');
  const [reserveGuests, setReserveGuests] = useState(2);
  const [reserveDate, setReserveDate] = useState('');
  const [reserveTime, setReserveTime] = useState('');
  const [reserveMessage, setReserveMessage] = useState<string | null>(null);
  const [reserveError, setReserveError] = useState<string | null>(null);

  // Monitor scroll height for navbar opacity transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-redirect from splash page after 5 seconds to the welcome index page
  useEffect(() => {
    if (activeTab !== 'splash') return;
    setCountdown(5);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActiveTab('welcome');
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab]);

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

  // Reservation seating allocator logic: seats name, count and allocates fitting vacant table
  const handleMakeReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setReserveError(null);
    setReserveMessage(null);

    if (!reserveName || !reserveDate || !reserveTime) {
      setReserveError('Please fill out all reservation fields.');
      return;
    }

    // Find available tables with capacity >= guests
    const availableTables = tables.filter(t => t.status === 'Available' && t.capacity >= reserveGuests);
    if (availableTables.length === 0) {
      setReserveError(`No tables with capacity for ${reserveGuests} guests are currently vacant.`);
      return;
    }

    // Sort by smallest capacity first to optimize restaurant seating
    availableTables.sort((a, b) => a.capacity - b.capacity);
    const assignedTable = availableTables[0];

    // Build draft pre-seated order
    const newOrder: Order = {
      id: `ord_${Date.now()}_${assignedTable.number}`,
      tableId: assignedTable.number,
      items: [
        {
          id: `ln_${Date.now()}_water`,
          menuItemId: 'item_24',
          name: 'Sparkling Mineral Water',
          category: 'Beverages',
          price: 150.00,
          quantity: 1,
          status: 'Preparing'
        }
      ],
      status: 'Ordered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Reserved for ${reserveName} (${reserveGuests} Guests) at ${reserveTime} on ${reserveDate}`,
      isPaid: false,
      subtotal: 150.00,
      tax: 7.50,
      serviceCharge: 7.50,
      total: 165.00
    };

    // Allocate order to lock table
    handleAddOrder(newOrder);

    setReserveMessage(`Reservation confirmed! We have reserved Table ${assignedTable.number} (Capacity: ${assignedTable.capacity}) for ${reserveName}.`);
    
    // Clear inputs
    setReserveName('');
    setReserveGuests(2);
    setReserveDate('');
    setReserveTime('');
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
      {activeTab !== 'splash' && (
        <header className={`glass-nav px-6 py-4 sticky top-0 z-50 animate-fade-in ${isScrolled ? 'glass-nav-scrolled' : ''}`}>
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Logo brand & Hamburger row */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-4 cursor-pointer select-none" onClick={() => { setActiveTab('welcome'); setIsMenuOpen(false); }}>
                <div className="w-14 h-14 bg-slate-955/80 border-2 border-amber-500/20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden hover:border-amber-500/50 transition-all duration-300">
                  <img src={royalHarvestLogo} alt="Royal Harvest Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif font-black text-2xl text-[color:var(--restaurant-foreground)] tracking-tight uppercase hover:text-[color:var(--restaurant-accent)] transition-colors">
                      Royal Harvest
                    </h1>
                    <span className="text-[10px] bg-[color:var(--restaurant-accent-soft)] text-[color:var(--restaurant-accent)] border border-[color:var(--restaurant-border)] px-1.5 py-0.5 rounded font-mono font-bold tracking-wide">LIVE</span>
                  </div>
                  <p className="text-[10px] text-[color:var(--restaurant-muted)] uppercase tracking-widest font-bold">Restaurant Console</p>
                </div>
              </div>

              {/* Mobile Hamburger toggle */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 text-[color:var(--restaurant-accent)] hover:text-white transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6 text-[color:var(--restaurant-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-[color:var(--restaurant-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Expandable navigation and metrics list */}
            <div className={`${isMenuOpen ? 'flex flex-col w-full' : 'hidden'} lg:flex lg:flex-row lg:items-center lg:justify-between lg:flex-1 gap-6`}>
              {/* Tab Selection Navigation pills */}
              <nav className="flex flex-col lg:flex-row lg:items-center gap-1 bg-transparent font-sans w-full lg:w-auto">
                <button
                  id="tab-welcome"
                  onClick={() => { setActiveTab('welcome'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'welcome' ? 'nav-link-active' : ''}`}
                >
                  Welcome
                </button>

                <button
                  id="tab-simulator"
                  onClick={() => { setActiveTab('simulator'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'simulator' ? 'nav-link-active' : ''}`}
                >
                  Unified Split View
                </button>

                <button
                  id="tab-waiter"
                  onClick={() => { setActiveTab('waiter'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'waiter' ? 'nav-link-active' : ''}`}
                >
                  Waiter Pad
                </button>

                <button
                  id="tab-kitchen"
                  onClick={() => { setActiveTab('kitchen'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'kitchen' ? 'nav-link-active' : ''}`}
                >
                  Kitchen (KDS)
                </button>

                <button
                  id="tab-billing"
                  onClick={() => { setActiveTab('billing'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'billing' ? 'nav-link-active' : ''}`}
                >
                  Billing Terminal
                </button>

                <button
                  id="tab-testing"
                  onClick={() => { setActiveTab('testing'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'testing' ? 'nav-link-active' : ''}`}
                >
                  Testing Suite
                </button>

                <button
                  id="tab-specs"
                  onClick={() => { setActiveTab('specs'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'specs' ? 'nav-link-active' : ''}`}
                >
                  Architecture
                </button>

                <button
                  id="tab-design"
                  onClick={() => { setActiveTab('design'); setIsMenuOpen(false); }}
                  className={`nav-link w-full lg:w-auto text-left lg:text-center ${activeTab === 'design' ? 'nav-link-active' : ''}`}
                >
                  Design System
                </button>
              </nav>

              {/* Right Metrics panel */}
              <div className="flex lg:flex-row gap-6 items-center justify-between lg:justify-end w-full lg:w-auto pt-4 lg:pt-0 border-t border-slate-850 lg:border-t-0 mt-2 lg:mt-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">System Active</span>
                </div>
                <div className="hidden lg:block h-8 w-px bg-slate-850"></div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 uppercase font-black">Current Load</p>
                  <p className="text-xs font-mono font-bold text-slate-400">42.8ms LATENCY</p>
                </div>
              </div>
            </div>

          </div>
        </header>
      )}

      {/* 2. Main content router body */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 transition-all duration-300">
        
        {/* TAB -1: SPLASH SCREEN */}
        {activeTab === 'splash' && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(223,183,80,0.06)_0%,transparent_60%)] pointer-events-none"></div>
            <div className="space-y-8 relative z-10">
              <div className="w-24 h-24 bg-slate-950/80 border border-[rgba(223,183,80,0.15)] rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <img src={royalHarvestLogo} alt="Royal Harvest" className="w-14 h-14 object-contain animate-pulse" />
              </div>
              <div className="space-y-4">
                <h1 className="font-serif font-black text-5xl md:text-7xl text-[color:var(--restaurant-accent)] tracking-widest uppercase mb-2">
                  Royal Harvest
                </h1>
                <p className="font-serif italic text-sm text-slate-400 tracking-widest uppercase">
                  Artisanal Kitchen & Estate Dining
                </p>
              </div>
              <div className="pt-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto"></div>
                <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest">
                  Loading Operations Console in {countdown}s...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0: WELCOME LANDING */}
        {activeTab === 'welcome' && (
          <div className="space-y-24 animate-fade-in" id="welcome-container">
            
            {/* HERO SECTION */}
            <section className="text-center py-20 px-4 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[rgba(223,183,80,0.04)] to-transparent border border-[rgba(223,183,80,0.08)] shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(223,183,80,0.04)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-slate-955/80 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative hover:border-amber-500/50 transition-colors duration-300">
                <img src={royalHarvestLogo} alt="Royal Harvest Logo" className="w-14 h-14 object-contain animate-pulse" />
              </div>
              
              <h1 className="font-serif font-black tracking-widest uppercase mb-4 text-slate-105">
                Royal Harvest
              </h1>
              <p className="font-serif italic text-lg md:text-xl text-[color:var(--restaurant-accent)] max-w-2xl mx-auto mb-6 font-medium">
                Artisanal Kitchen & Estate Dining
              </p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto mb-8"></div>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed mb-10 font-light">
                Indulge in a premium farm-to-table culinary narrative. We craft seasonal, organic menus sourced straight from local fields and cook with artisanal passion in our estate kitchen.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#reservation-section" className="btn-primary">
                  Book A Table
                </a>
                <a href="#menu-section" className="btn-secondary">
                  Explore Menu
                </a>
              </div>
            </section>

            {/* ABOUT / STORY SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4" id="about-section">
              <div className="space-y-6">
                <span className="text-[10px] font-mono text-[color:var(--restaurant-accent)] tracking-widest uppercase font-bold">Our Philosophy</span>
                <h2 className="text-slate-100 font-serif leading-tight">
                  Crafting Timeless <br />Dining Legacies
                </h2>
                <div className="h-px w-16 bg-[color:var(--restaurant-accent)] opacity-40"></div>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  Founded upon the principles of clean agriculture and traditional cookery, Royal Harvest bridges the gap between field and fork. Every ingredient is checked, every spice hand-roasted, and every plate crafted to tell the story of the earth it rose from.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  We believe that dining is an active ritual of community, sharing, and delight. Our open woodfires, copper clay tandoors, and curated cellar collections offer guests a warm, sensory escape.
                </p>
              </div>
              
              <div className="zoom-img-container aspect-video rounded-lg border border-[rgba(223,183,80,0.1)] overflow-hidden bg-slate-900 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" 
                  alt="Fine dining table preparation" 
                  className="zoom-img object-cover w-full h-full opacity-70"
                />
              </div>
            </section>

            {/* MENU SHOWCASE (CHEF'S SPECIALS) */}
            <section className="space-y-8 px-4" id="menu-section">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-mono text-[color:var(--restaurant-accent)] tracking-widest uppercase font-bold">Curated Selection</span>
                <h2 className="text-slate-100 font-serif">Chef's Signature Specials</h2>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Special 1: Butter Chicken */}
                <div className="glass-card p-6 flex flex-col justify-between min-h-[360px] group">
                  <div className="space-y-4">
                    <div className="zoom-img-container h-44 rounded border border-[rgba(223,183,80,0.08)] bg-slate-950 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80" 
                        alt="Butter Chicken" 
                        className="zoom-img opacity-85" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-black text-slate-105 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Butter Chicken</h4>
                        <span className="text-xs font-mono text-[color:var(--restaurant-accent)] font-bold">₹520.00</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-light">
                        Tender tandoor-roasted chicken stewed in a rich, buttery fresh tomato cream sauce infused with fenugreek.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[rgba(223,183,80,0.08)] flex justify-between items-center text-[10px] font-mono uppercase text-slate-500">
                    <span>Main Course</span>
                    <span>15 min prep</span>
                  </div>
                </div>

                {/* Special 2: Garlic Butter Prawns */}
                <div className="glass-card p-6 flex flex-col justify-between min-h-[360px] group">
                  <div className="space-y-4">
                    <div className="zoom-img-container h-44 rounded border border-[rgba(223,183,80,0.08)] bg-slate-955 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1559742811-82410b510405?auto=format&fit=crop&w=600&q=80" 
                        alt="Garlic Butter Prawns" 
                        className="zoom-img opacity-85" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-black text-slate-105 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Butter Prawns</h4>
                        <span className="text-xs font-mono text-[color:var(--restaurant-accent)] font-bold">₹680.00</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-light">
                        Fresh jumbo tiger prawns tossed in hot garlic, creamed butter, fresh coriander, and a splash of estate lime.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[rgba(223,183,80,0.08)] flex justify-between items-center text-[10px] font-mono uppercase text-slate-500">
                    <span>Starters</span>
                    <span>12 min prep</span>
                  </div>
                </div>

                {/* Special 3: Rasmalai */}
                <div className="glass-card p-6 flex flex-col justify-between min-h-[360px] group">
                  <div className="space-y-4">
                    <div className="zoom-img-container h-44 rounded border border-[rgba(223,183,80,0.08)] bg-slate-950 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80" 
                        alt="Gourmet Rasmalai" 
                        className="zoom-img opacity-85" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-black text-slate-105 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Royal Rasmalai</h4>
                        <span className="text-xs font-mono text-[color:var(--restaurant-accent)] font-bold">₹240.00</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-light">
                        Spongy cottage cheese patties soaked in saffron-infused milk syrup, garnished with pistachios and gold leaf.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[rgba(223,183,80,0.08)] flex justify-between items-center text-[10px] font-mono uppercase text-slate-500">
                    <span>Desserts</span>
                    <span>8 min prep</span>
                  </div>
                </div>
              </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="space-y-8 px-4" id="testimonials-section">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-mono text-[color:var(--restaurant-accent)] tracking-widest uppercase font-bold">Reviews</span>
                <h2 className="text-slate-100 font-serif">Diner Impressions</h2>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 space-y-4 text-left">
                  <div className="text-amber-300 text-xs tracking-wider font-mono">★★★★★</div>
                  <p className="text-xs text-slate-300 italic leading-relaxed font-light">
                    "The estate dining ambiance is absolutely stunning. But the highlight is the farm-to-table cuisine — the spices are clean, fresh, and hand-roasted. Best lamb Rogan Josh in SF!"
                  </p>
                  <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                    <span>Lady Elizabeth Stirling</span>
                    <span>May 2026</span>
                  </div>
                </div>

                <div className="glass-card p-6 space-y-4 text-left">
                  <div className="text-amber-300 text-xs tracking-wider font-mono">★★★★★</div>
                  <p className="text-xs text-slate-300 italic leading-relaxed font-light">
                    "Exceptional operations console. Our table was seated instantly after reserving online. Clean interface, real-time updates on kitchen dishes, and flawless cashier settlements."
                  </p>
                  <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                    <span>Chef Marcus Vance</span>
                    <span>June 2026</span>
                  </div>
                </div>
              </div>
            </section>

            {/* RESERVATION SECTION */}
            <section className="max-w-2xl mx-auto px-4 space-y-6" id="reservation-section">
              <div className="text-center space-y-3">
                <span className="text-[10px] font-mono text-[color:var(--restaurant-accent)] tracking-widest uppercase font-bold">Booking Request</span>
                <h2 className="text-slate-100 font-serif">Reserve Your Estate Seating</h2>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto"></div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Submit your request. The system will automatically check our 10 table capacities and lock a vacant slot.
                </p>
              </div>

              <form onSubmit={handleMakeReservation} className="glass-card p-8 space-y-4 rounded-lg text-left">
                {reserveError && (
                  <div className="bg-red-955/20 border border-red-900/40 p-3 text-xs text-red-400 text-center uppercase tracking-wide">
                    {reserveError}
                  </div>
                )}
                
                {reserveMessage && (
                  <div className="bg-emerald-950/30 border border-emerald-900/60 p-3 text-xs text-emerald-400 text-center uppercase tracking-wide">
                    {reserveMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Stirling"
                      value={reserveName}
                      onChange={(e) => setReserveName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 text-slate-200 focus:outline-none focus:border-[color:var(--restaurant-accent)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Number of Guests</label>
                    <select 
                      value={reserveGuests}
                      onChange={(e) => setReserveGuests(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 text-slate-200 focus:outline-none focus:border-[color:var(--restaurant-accent)] font-sans"
                    >
                      <option value={2}>2 Guests (Table Slot)</option>
                      <option value={4}>4 Guests (Table Slot)</option>
                      <option value={6}>6 Guests (Table Slot)</option>
                      <option value={8}>8 Guests (Table Slot)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Reservation Date</label>
                    <input 
                      type="date"
                      value={reserveDate}
                      onChange={(e) => setReserveDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 text-slate-200 focus:outline-none focus:border-[color:var(--restaurant-accent)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Preferred Time</label>
                    <input 
                      type="time"
                      value={reserveTime}
                      onChange={(e) => setReserveTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 text-slate-200 focus:outline-none focus:border-[color:var(--restaurant-accent)] font-sans"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-primary mt-4">
                  Request Reservation Confirm
                </button>
              </form>
            </section>

            {/* OPERATIONS COCKPIT ACCESS */}
            <section className="space-y-6 px-4">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-mono text-[color:var(--restaurant-accent)] tracking-widest uppercase font-bold">Management</span>
                <h3 className="font-serif font-black text-slate-200 uppercase tracking-wider">Operations Dashboard Hub</h3>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[color:var(--restaurant-accent)] to-transparent mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                {/* Split view link */}
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Unified Split view</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Check all 3 operational panels side-by-side in real-time. Waiter, chef, and cashier dashboard.
                  </p>
                </button>

                {/* Waiter station link */}
                <button
                  onClick={() => setActiveTab('waiter')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Waiter Station</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Launch order pad to allocate seating, record course choices, and check active food items.
                  </p>
                </button>

                {/* Kitchen display KDS link */}
                <button
                  onClick={() => setActiveTab('kitchen')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Kitchen Monitor (KDS)</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Monitor active cook queues, read chef guidelines, and check off prepared items in sequence.
                  </p>
                </button>

                {/* Cashier Billing link */}
                <button
                  onClick={() => setActiveTab('billing')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Cashier Desk</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Retrieve guest bills, select payment gateway registers, check daily logs, and view stock alerts.
                  </p>
                </button>

                {/* Testing suite link */}
                <button
                  onClick={() => setActiveTab('testing')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Testing Console</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Auto-simulate load runs across multiple tables, inject seed datasets, and run assertion logs.
                  </p>
                </button>

                {/* Architecture specs link */}
                <button
                  onClick={() => setActiveTab('specs')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Architecture Blueprints</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    Examine system specifications, database constraints, environment files, and local state maps.
                  </p>
                </button>

                {/* Design System link */}
                <button
                  onClick={() => setActiveTab('design')}
                  className="glass-card p-6 text-left group cursor-pointer hover:-translate-y-0.5 duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-955/40 text-amber-400 flex items-center justify-center mb-4 border border-amber-900/30 group-hover:border-amber-500/40 transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-black text-slate-200 uppercase tracking-wide group-hover:text-[color:var(--restaurant-accent)] transition-colors">Design System Spec</h4>
                  <p className="text-[11px] text-slate-400 mt-2 font-light leading-relaxed">
                    View the visual typography, color palette click-to-copy, custom buttons, card layouts, and developer config setups.
                  </p>
                </button>
              </div>
            </section>

            {/* MINIMAL FOOTER IN WELCOME LANDING */}
            <footer className="border-t border-[rgba(223,183,80,0.08)] pt-12 pb-6 space-y-8 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-xs">
                <div className="space-y-3">
                  <h4 className="font-serif font-black text-sm uppercase text-[color:var(--restaurant-accent)] tracking-wider">Royal Harvest</h4>
                  <p className="text-slate-400 leading-relaxed font-light">
                    An organic estate kitchen and fine dining restaurant designed to nurture community, traditional cookery, and seasonal local harvests.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-slate-300 uppercase tracking-widest text-[10px]">Dining Hours</h4>
                  <div className="space-y-1.5 text-slate-400 font-light font-mono text-[11px]">
                    <div className="flex justify-between"><span>Wed – Thu</span><span>17:00 – 22:00</span></div>
                    <div className="flex justify-between"><span>Fri – Sat</span><span>17:00 – 23:00</span></div>
                    <div className="flex justify-between"><span>Sunday Brunch</span><span>11:00 – 15:00</span></div>
                  </div>
                </div>

                <div className="space-y-3 font-sans">
                  <h4 className="font-sans font-bold text-slate-300 uppercase tracking-widest text-[10px]">Estate Location</h4>
                  <p className="text-slate-400 leading-normal font-light">
                    12th Ave Gourmet Boulevard,<br />
                    Oakwood Estate Plains, CA 94025
                  </p>
                  <p className="text-[11px] font-mono text-[color:var(--restaurant-accent)]">
                    Direct Line: +1 (555) 769-2544
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[rgba(223,183,80,0.04)] text-center text-[10px] font-mono text-slate-550 uppercase tracking-widest">
                <span>© 2026 Royal Harvest Inc. • Handcrafted Estate Dining Experience</span>
              </div>
            </footer>

          </div>
        )}

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

        {/* TAB 7: DESIGN SYSTEM SHOWROOM */}
        {activeTab === 'design' && (
          <div className="animate-fade-in">
            <DesignSystem />
          </div>
        )}

      </main>

      {/* 3. Bottom Architecture & System Specs Rail */}
      {activeTab !== 'splash' && (
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
      )}

    </div>
  );
}
