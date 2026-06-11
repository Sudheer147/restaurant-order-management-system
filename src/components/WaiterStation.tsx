/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent, ChangeEvent } from 'react';
import { MenuItem, Order, OrderItem } from '../types';
import menuData from '../data/menu.json';
import { 
  Users, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Utensils, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Flame,
  Leaf,
  Sparkles
} from 'lucide-react';

interface WaiterStationProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  tables: { number: number; capacity: number; status: string }[];
  itemStock: Record<string, number>; // Dynamic stock levels
  onReduceStock: (itemId: string, qty: number) => void;
}

export default function WaiterStation({
  orders,
  onAddOrder,
  tables,
  itemStock,
}: WaiterStationProps) {
  // Waiter-specific local states
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<Array<{ menuItem: MenuItem; quantity: number }>>([]);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const menuItems = menuData as MenuItem[];

  // Define categories list
  const categories = useMemo(() => {
    return ['All', 'Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts'];
  }, []);

  // Filter menu items by category & search query
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery, menuItems]);

  // Check if a table has an active order (Preparing or Ready or Ordered, not Served or paid)
  const getActiveOrderForTable = (tableNo: number) => {
    return orders.find(o => o.tableId === tableNo && !o.isPaid);
  };

  // Add to Cart
  const handleAddToCart = (item: MenuItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Check item availability
    if (!item.available) {
      setErrorMsg(`"${item.name}" is currently unavailable!`);
      return;
    }

    // 2. Check stock level mid-order (Stock constraint validation)
    const currentQtyInCart = cart.find(c => c.menuItem.id === item.id)?.quantity || 0;
    const availableStock = itemStock[item.id] !== undefined ? itemStock[item.id] : 15; // default stock 15

    if (currentQtyInCart + 1 > availableStock) {
      setErrorMsg(`Stock limit reached! Only ${availableStock} portion(s) of "${item.name}" left in the kitchen.`);
      return;
    }

    // 3. Update Cart
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { menuItem: item, quantity: 1 }];
      }
    });

    // Flash small success feedback
    setSuccessMsg(`Added 1x ${item.name} to cart.`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  // Update Cart Quantity
  const handleUpdateQty = (itemId: string, increment: boolean) => {
    setErrorMsg(null);
    const item = menuItems.find(m => m.id === itemId);
    if (!item) return;

    const currentItem = cart.find(c => c.menuItem.id === itemId);
    if (!currentItem) return;

    if (increment) {
      const availableStock = itemStock[itemId] !== undefined ? itemStock[itemId] : 15;
      if (currentItem.quantity + 1 > availableStock) {
        setErrorMsg(`Cannot add more. Only ${availableStock} portion(s) of "${item.name}" left in kitchen stock.`);
        return;
      }
      setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      if (currentItem.quantity === 1) {
        setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
      } else {
        setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
      }
    }
  };

  // Remove completely from cart
  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  // Compute Cart Summary
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const servicePercent = 0.05; // 5% Service Charge
    const taxPercent = 0.05; // 5% Gst Tax as standard
    const serviceCharge = parseFloat((subtotal * servicePercent).toFixed(2));
    const tax = parseFloat((subtotal * taxPercent).toFixed(2));
    const total = parseFloat((subtotal + tax + serviceCharge).toFixed(2));
    return { subtotal, serviceCharge, tax, total };
  }, [cart]);

  // Submit Order
  const handleSubmitOrder = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedTable === null) {
      setErrorMsg('Please select a table number first.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your order cart is empty. Please add items from the menu.');
      return;
    }

    // Check if table already has an active unpaid order (to prevent double-booking active tables)
    const activeOrder = getActiveOrderForTable(selectedTable);
    if (activeOrder) {
      setErrorMsg(`Table ${selectedTable} already has an active order (Status: ${activeOrder.status}). Generate or settle bill before taking secondary raw orders.`);
      return;
    }

    // Verify all cart items against stock again!
    for (const cartItem of cart) {
      const availableStock = itemStock[cartItem.menuItem.id] !== undefined ? itemStock[cartItem.menuItem.id] : 15;
      if (cartItem.quantity > availableStock) {
        setErrorMsg(`Stock ran out! ${cartItem.menuItem.name} only has ${availableStock} left. Adjust cart before sending.`);
        return;
      }
    }

    // Build OrderItem[]
    const items: OrderItem[] = cart.map(c => ({
      id: `${Date.now()}_${c.menuItem.id}_${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      category: c.menuItem.category,
      price: c.menuItem.price,
      quantity: c.quantity,
      status: 'Preparing',
    }));

    const newOrder: Order = {
      id: `ord_${Date.now()}_${selectedTable}`,
      tableId: selectedTable,
      items,
      status: 'Ordered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: orderNotes.trim() || undefined,
      isPaid: false,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      serviceCharge: cartTotals.serviceCharge,
      total: cartTotals.total,
    };

    onAddOrder(newOrder);

    // Clear and Toast success
    setCart([]);
    setOrderNotes('');
    setSuccessMsg(`Order successfully submitted for Table ${selectedTable}! Raised to Kitchen Display.`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="waiter-station">
      {/* Tables & Filters Pane */}
      <div className="lg:col-span-3 space-y-6">
        {/* Table Selection Grid */}
        <div className="bg-slate-900 p-5 rounded-none border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h3 className="font-serif font-black text-xs uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              01. TABLES VIEW
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold">10 TABLES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {tables.map((t) => {
              const activeOrder = getActiveOrderForTable(t.number);
              const isSelected = selectedTable === t.number;
              
              let tableBg = 'bg-slate-950 text-slate-400 hover:bg-slate-800/60 border-slate-800';
              let badge = '🟢 Available';
              let badgeColor = 'text-emerald-400 bg-emerald-950/60 border border-emerald-900';

              if (activeOrder) {
                if (activeOrder.status === 'Ready') {
                  tableBg = 'bg-amber-950/30 text-amber-300 border-amber-800 hover:bg-amber-950/70';
                  badge = '🟡 Waiting Bill';
                  badgeColor = 'text-amber-300 bg-amber-950/80 border border-amber-800';
                } else {
                  tableBg = 'bg-red-950/50 text-red-300 border-red-800 hover:bg-red-950/75';
                  badge = '🔴 Occupied';
                  badgeColor = 'text-red-300 bg-red-950/80 border border-red-800';
                }
              }

              if (isSelected) {
                tableBg = 'bg-amber-600 text-slate-950 border-amber-500 font-extrabold scale-100 transition-all';
              }

              return (
                <button
                  id={`btn-table-${t.number}`}
                  key={t.number}
                  onClick={() => {
                    setSelectedTable(t.number);
                    setErrorMsg(null);
                    setCart([]); // Reset scratch cart on changing table to protect draft state
                  }}
                  className={`flex flex-col items-center justify-between min-h-[96px] p-3 rounded-none border text-center transition-all cursor-pointer ${tableBg}`}
                >
                  <div>
                    <span className="text-[9px] font-mono leading-none">T{t.number}</span>
                    <span className="text-2xl font-black mt-1 block">{t.number}</span>
                  </div>
                  <div className="mt-3">
                    <span className={`inline-flex items-center justify-center text-[9px] font-semibold px-2 py-1 rounded-none uppercase tracking-tight ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="bg-slate-900 p-5 rounded-none border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <h3 className="font-sans font-black text-xs uppercase tracking-tight text-slate-100 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-slate-400" />
              02. BROWSE GOURMET MENU
            </h3>
            
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder="Search dish or description..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-800 rounded-none focus:outline-none focus:border-amber-500 text-xs placeholder:text-slate-500 bg-slate-950 text-slate-100"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-850">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  id={`btn-category-${cat.replace(' ', '_')}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`sub-nav-link ${active ? 'sub-nav-link-active' : ''}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredMenuItems.map((item) => {
              const stock = itemStock[item.id] !== undefined ? itemStock[item.id] : 15;
              const isOut = !item.available || stock === 0;

              return (
                <div 
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  className={`group relative p-4 rounded-none border transition-all flex flex-col justify-between ${
                    isOut 
                      ? 'bg-slate-950/40 border-slate-800 opacity-60' 
                      : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/70'
                  }`}
                >
                  {item.imageUrl ? (
                    <div className="mb-3 overflow-hidden rounded-none border border-slate-800 bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-24 object-cover"
                        onError={(event: Event) => {
                          const target = event.currentTarget as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/320x200.png?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  ) : null}

                  <div>
                    {/* Header: Name, Spice/Vegetarian badges */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-sans font-bold text-slate-100 group-hover:text-amber-400 transition-colors text-xs uppercase tracking-tight">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-amber-400 text-[10px] uppercase tracking-[0.2em]">
                          <Sparkles className="w-3 h-3" />
                          <span>{item.rating ?? 5}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {item.isVegan && (
                          <span className="p-0.5 bg-green-950/50 rounded-none border border-green-905 text-green-400" title="Vegan">
                            <Leaf className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {item.spicyLevel && item.spicyLevel > 0 ? (
                          <span className="p-0.5 bg-red-950/50 rounded-none border border-red-905 text-red-400 flex items-center" title={`Spicy Level: ${item.spicyLevel}`}>
                            <Flame className="w-3.5 h-3.5 fill-red-500 text-red-400" />
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-sans font-black text-slate-100 text-sm">
                        ₹{item.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono mt-0.5 uppercase">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          {item.prepTime}m
                        </span>
                        <span>•</span>
                        {isOut ? (
                          <span className="text-red-500 font-semibold tracking-tight">Sold Out</span>
                        ) : (
                          <span className={`${stock <= 3 ? 'text-amber-500 font-semibold' : 'text-slate-500'}`}>
                            {stock} LEFT
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`btn-add-${item.id}`}
                      disabled={isOut}
                      onClick={() => handleAddToCart(item)}
                      className={`p-2 rounded-none cursor-pointer flex items-center justify-center transition-all ${
                        isOut 
                          ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                          : 'bg-slate-800 text-slate-100 hover:bg-emerald-800 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Sidebar */}
      <div className="lg:col-span-1">
        <form onSubmit={handleSubmitOrder} className="bg-slate-900 p-5 rounded-none border border-slate-800 flex flex-col justify-between h-full min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 font-sans">
              <h3 className="font-sans font-black text-xs uppercase tracking-tight text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                TABLE PAD
              </h3>
              <div className="bg-emerald-800 text-white px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold">
                {selectedTable ? `T - ${selectedTable}` : 'LOCKED'}
              </div>
            </div>

            {/* Notifications panel in Side bar */}
            {errorMsg && (
              <div className="bg-red-955/30 border border-red-900/60 p-3 rounded-none text-xs text-red-400 flex items-start gap-2 mb-4 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-955/30 border border-green-900/60 p-3 rounded-none text-xs text-green-400 flex items-start gap-2 mb-4">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {!selectedTable ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-800 bg-slate-950 rounded-none">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs uppercase tracking-wider font-extrabold text-slate-400">Terminal Locked</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Tap a table number block on the left to begin compiling an order.</p>
              </div>
            ) : (
              <div>
                {/* Cart Items list */}
                {cart.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <ShoppingBag className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Cart Empty</p>
                    <p className="text-[10px] text-slate-500 mt-1">Select from our 30-item catalog on the left to stack items.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {cart.map((c) => (
                      <div key={c.menuItem.id} className="flex items-center justify-between gap-2 p-2 bg-slate-950 border border-slate-850/80 rounded-none font-sans" id={`cart-item-${c.menuItem.id}`}>
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="text-[11px] font-bold text-slate-100 truncate uppercase mt-0.5">{c.menuItem.name}</h5>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">₹{(c.menuItem.price * c.quantity).toFixed(2)}</p>
                        </div>

                        {/* Cart Adjustments */}
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-cart-minus-${c.menuItem.id}`}
                            type="button"
                            onClick={() => handleUpdateQty(c.menuItem.id, false)}
                            className="w-5 h-5 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-100 w-4 text-center">{c.quantity}</span>
                          <button
                            id={`btn-cart-plus-${c.menuItem.id}`}
                            type="button"
                            onClick={() => handleUpdateQty(c.menuItem.id, true)}
                            className="w-5 h-5 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-800 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            id={`btn-cart-del-${c.menuItem.id}`}
                            type="button"
                            onClick={() => handleRemoveFromCart(c.menuItem.id)}
                            className="p-1 text-red-400 hover:bg-red-950/40 border border-transparent rounded-none cursor-pointer ml-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Instructions */}
                {cart.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-[9px] font-bold font-sans text-slate-500 mb-1 uppercase tracking-wider">KITCHEN COOKING NOTES</label>
                    <textarea
                      id="notes-textarea"
                      placeholder="e.g., No onions, extra spicy, sauce on side..."
                      value={orderNotes}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-slate-800 rounded-none text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 bg-slate-950 text-slate-100"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedTable && cart.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-850 space-y-4">
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Chg (5%)</span>
                  <span>₹{cartTotals.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT/GST (5%)</span>
                  <span>₹{cartTotals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold text-xs border-y border-dashed border-slate-800 py-2 my-1 uppercase">
                  <span>Total Amount</span>
                  <span>₹{cartTotals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="btn-submit-order"
                type="submit"
                className="w-full py-2.5 bg-amber-600 text-slate-950 rounded-none font-sans font-black text-[10px] hover:bg-amber-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-amber-600 uppercase tracking-widest text-center"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Send Order to Kitchen
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
