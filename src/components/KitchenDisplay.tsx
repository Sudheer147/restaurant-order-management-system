/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../types';
import { 
  Clock, 
  Check, 
  UtensilsCrossed, 
  Volume2, 
  ChefHat, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface KitchenDisplayProps {
  orders: Order[];
  onUpdateOrderItemStatus: (orderId: string, itemLineId: string, newStatus: 'Preparing' | 'Ready') => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export default function KitchenDisplay({
  orders,
  onUpdateOrderItemStatus,
  onUpdateOrderStatus,
}: KitchenDisplayProps) {
  // We want a live timer that forces a render to update the 'elapsed time' every few seconds!
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 5000); // refresh every 5 seconds to update minute logs
    return () => clearInterval(timer);
  }, []);

  // Filter out orders that are already served and paid (keep those preparing/ready or unpaid served ones in view if they need review)
  const activeKitchenOrders = orders.filter(
    (order) => !order.isPaid && order.status !== 'Served'
  );

  const readyCount = activeKitchenOrders.filter((order) => order.status === 'Ready').length;
  const preparingCount = activeKitchenOrders.filter((order) => order.status === 'Preparing').length;
  const pendingCount = activeKitchenOrders.filter((order) => order.status === 'Ordered').length;

  // Calculate elapsed time in string
  const getElapsedTime = (createdAtString: string) => {
    const created = new Date(createdAtString);
    const diffMs = now.getTime() - created.getTime();
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(diffSecs / 60);

    if (mins < 1) {
      return 'Just now';
    }
    return `${mins}m ago`;
  };

  // Check if order is critical (cooking for more than 15 minutes)
  const isCriticalTime = (createdAtString: string) => {
    const created = new Date(createdAtString);
    const diffMs = now.getTime() - created.getTime();
    return diffMs > 15 * 60 * 1000; // 15 minutes
  };

  // Quick action: mark all items in an order as Ready at once
  const handleMarkAllReady = (order: Order) => {
    order.items.forEach((item) => {
      if (item.status === 'Preparing') {
        onUpdateOrderItemStatus(order.id, item.id, 'Ready');
      }
    });
    onUpdateOrderStatus(order.id, 'Ready');
  };

  return (
    <div className="space-y-6" id="kitchen-display">
      {/* Overview stats bar */}
      <div className="bg-slate-900 p-4 rounded-none border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-slate-950 rounded-none font-bold">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-black text-xs uppercase tracking-tight text-slate-100">Kitchen Status</h3>
            <p className="text-[11px] text-slate-400">Live order queue with real-time production state.</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="bg-slate-950 px-3 py-1.5 rounded-none text-center border border-slate-800 min-w-[88px]">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">🟢 Ready</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{readyCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-none text-center border border-slate-800 min-w-[88px]">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">🟡 Preparing</span>
            <span className="text-sm font-black text-amber-400 font-mono">{preparingCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-none text-center border border-slate-800 min-w-[88px]">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">🔴 Pending</span>
            <span className="text-sm font-black text-red-400 font-mono">{pendingCount}</span>
          </div>
        </div>
      </div>

      {activeKitchenOrders.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-none border border-slate-800 max-w-lg mx-auto">
          <div className="relative inline-block mb-4">
            <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto" />
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-2 animate-bounce" />
          </div>
          <h4 className="font-sans font-black text-xs uppercase tracking-wider text-slate-200">No Active Ticket Orders</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto px-4 leading-relaxed">
            All tables served or empty. New guest entries placed on the waiter terminal will populate here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeKitchenOrders.map((order) => {
            const critical = isCriticalTime(order.createdAt);
            const allItemsReady = order.items.every(it => it.status === 'Ready');

            let bannerBorderColor = 'border-l-emerald-700';
            if (critical) bannerBorderColor = 'border-l-red-500';
            else if (allItemsReady) bannerBorderColor = 'border-l-emerald-500 animate-pulse';
            else if (order.status === 'Preparing') bannerBorderColor = 'border-l-amber-500';

            return (
              <div 
                key={order.id}
                id={`kitchen-card-${order.id}`}
                className={`bg-slate-900 rounded-none border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between border-l-4 ${bannerBorderColor}`}
              >
                {/* Card Header: Table No & Elapsed timer */}
                <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">KDS_UID: {order.id.split('_')[1] || 'TICK'}</span>
                    <h3 className="text-base font-black text-slate-100 font-sans flex items-center gap-1.5 mt-0.5 uppercase tracking-tight">
                      Table {order.tableId}
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded-none">
                        {order.items.length} ITEMS
                      </span>
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-tight">
                      <span className={`px-2 py-0.5 rounded-none border ${order.status === 'Ready' ? 'text-amber-300 bg-amber-950/80 border-amber-800' : order.status === 'Preparing' ? 'text-amber-300 bg-amber-950/80 border-amber-800' : 'text-red-300 bg-red-950/80 border-red-800'}`}>
                        {order.status === 'Ready' ? '🟢 Ready' : order.status === 'Preparing' ? '🟡 Preparing' : '🔴 Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-none border ${
                      critical 
                        ? 'bg-red-950/40 border-red-900 text-red-450 animate-pulse' 
                        : 'bg-slate-900 border-slate-800 text-slate-350'
                    }`}>
                      <Clock className="w-3 h-3 text-slate-400" />
                      {getElapsedTime(order.createdAt)}
                    </span>
                    {critical && (
                      <span className="block text-[8px] text-red-500 font-bold uppercase mt-1 tracking-tight flex items-center justify-end gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> OVER TIMEOUT
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: Cooking Notes & Item List */}
                <div className="p-4 flex-1 space-y-4">
                  {order.notes && (
                    <div className="p-3 bg-amber-950/20 border-l-2 border-amber-600 rounded-none text-xs text-amber-300">
                      <span className="font-bold uppercase tracking-wider text-[9px] block text-amber-400 mb-0.5">CHEF NOTES:</span>
                      {order.notes}
                    </div>
                  )}

                  {/* Ordering item rows */}
                  <div className="divide-y divide-slate-850">
                    {order.items.map((item) => {
                      const isReady = item.status === 'Ready';
                      return (
                        <div 
                          key={item.id}
                          className="py-2 flex items-center justify-between gap-4 group"
                          id={`kitchen-item-${item.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-none bg-slate-950 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-850">
                                {item.quantity}
                              </span>
                              <span className={`font-semibold text-xs truncate uppercase ${isReady ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 tracking-tight font-semibold block pl-7 uppercase">{item.category}</span>
                          </div>

                          {/* Quick item check-off button */}
                          <button
                            id={`btn-ready-item-${item.id}`}
                            onClick={() => {
                              const targetStatus = isReady ? 'Preparing' : 'Ready';
                              onUpdateOrderItemStatus(order.id, item.id, targetStatus);
                            }}
                            className={`p-1 rounded-none border transition-all cursor-pointer ${
                              isReady 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900' 
                                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-emerald-400 hover:border-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Overall Status actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 rounded-none flex items-center gap-2">
                  {order.status !== 'Ready' ? (
                    <>
                      <button
                        id={`btn-all-ready-${order.id}`}
                        onClick={() => handleMarkAllReady(order)}
                        className="flex-1 py-1.5 px-3 text-[10px] font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-amber-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                        All Ready
                      </button>
                      <button
                        id={`btn-preparing-${order.id}`}
                        onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                        disabled={order.status === 'Preparing'}
                        className={`py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                          order.status === 'Preparing'
                            ? 'bg-amber-950/40 border-amber-800/80 text-amber-300 cursor-default'
                            : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {order.status === 'Preparing' ? 'COOKING' : 'COOK ITEM'}
                      </button>
                    </>
                  ) : (
                    <button
                      id={`btn-serve-order-${order.id}`}
                      onClick={() => onUpdateOrderStatus(order.id, 'Served')}
                      className="w-full py-2 px-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-600"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Dispatch Table & Alert
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
