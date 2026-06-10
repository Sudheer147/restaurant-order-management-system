/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MenuItem, Order, OrderItem } from '../types';
import menuData from '../data/menu.json';
import { 
  Receipt, 
  CreditCard, 
  IndianRupee, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Trophy,
  Activity,
  Printer
} from 'lucide-react';

interface BillingStationProps {
  orders: Order[];
  tables: { number: number; capacity: number; status: string }[];
  itemStock: Record<string, number>;
  onSettleOrder: (orderId: string, paymentMethod: 'Cash' | 'Card' | 'UPI') => void;
}

export default function BillingStation({
  orders,
  tables,
  itemStock,
  onSettleOrder,
}: BillingStationProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('Card');
  const [successSettleMsg, setSuccessSettleMsg] = useState<string | null>(null);
  const [showPrintSpool, setShowPrintSpool] = useState(false);

  // Active (unpaid) order for selected table (if any)
  const activeOrder = useMemo(() => {
    if (selectedTable === null) return null;
    return orders.find(o => o.tableId === selectedTable && !o.isPaid);
  }, [selectedTable, orders]);

  // System Stats calculation
  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => o.isPaid);
    const grossSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const averageBill = paidOrders.length > 0 ? grossSales / paidOrders.length : 0;
    const occupiedCount = tables.filter(t => orders.some(o => o.tableId === t.number && !o.isPaid)).length;

    // Find top-selling food items
    const itemMap: Record<string, { count: number, name: string }> = {};
    orders.forEach(o => {
      o.items.forEach(it => {
        if (!itemMap[it.menuItemId]) {
          itemMap[it.menuItemId] = { count: 0, name: it.name };
        }
        itemMap[it.menuItemId].count += it.quantity;
      });
    });

    const topSelling = Object.values(itemMap).sort((a,b) => b.count - a.count)[0]?.name || 'N/A';

    return {
      grossSales,
      averageBill,
      occupiedCount,
      topSelling
    };
  }, [orders, tables]);

  const analytics = useMemo(() => {
    const paidOrders = orders.filter(o => o.isPaid);
    const now = new Date();
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    const isSameYear = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear();

    const totals = {
      grossSales: 0,
      dailySales: 0,
      monthlySales: 0,
      yearlySales: 0,
      cash: 0,
      card: 0,
      upi: 0,
      totalPaidOrders: paidOrders.length,
    };

    paidOrders.forEach(order => {
      const orderDate = new Date(order.updatedAt || order.createdAt);
      totals.grossSales += order.total;
      if (isSameDay(orderDate, now)) totals.dailySales += order.total;
      if (isSameMonth(orderDate, now)) totals.monthlySales += order.total;
      if (isSameYear(orderDate, now)) totals.yearlySales += order.total;

      if (order.paymentMethod === 'Cash') totals.cash += order.total;
      if (order.paymentMethod === 'Card') totals.card += order.total;
      if (order.paymentMethod === 'UPI') totals.upi += order.total;
    });

    return totals;
  }, [orders]);

  const inventory = useMemo(() => {
    const menuItems = menuData as MenuItem[];
    const stockRows = Object.entries(itemStock).map(([id, qty]) => {
      const menuItem = menuItems.find(item => item.id === id);
      return {
        id,
        qty,
        name: menuItem?.name ?? id,
        value: (menuItem?.price ?? 0) * qty,
      };
    });

    const totalUnits = stockRows.reduce((sum, row) => sum + row.qty, 0);
    const totalValue = stockRows.reduce((sum, row) => sum + row.value, 0);
    const lowStock = stockRows.filter(row => row.qty <= 5).sort((a,b) => a.qty - b.qty).slice(0, 5);

    return { totalUnits, totalValue, lowStock };
  }, [itemStock]);

  const buildPrebillHtml = (order: Order) => {
    const orderLines = order.items.map(it => `
      <tr>
        <td style="padding:4px 0; font-size:12px;">${it.quantity} x ${it.name}</td>
        <td style="padding:4px 0; text-align:right; font-size:12px;">₹${(it.price * it.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Prebill Copy</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111; }
          .receipt { max-width: 360px; margin: auto; }
          .receipt h2 { margin-bottom: 8px; font-size: 18px; letter-spacing: 1px; }
          .receipt p, .receipt td { margin: 0; font-size: 12px; }
          .receipt table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .receipt td { padding: 3px 0; }
          .summary td { padding: 3px 0; border-top: 1px solid #ddd; }
          .total-row td { font-weight: bold; font-size: 14px; }
          .footer { margin-top: 14px; font-size: 11px; text-align: center; color: #444; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h2>Royal Harvest Cafe</h2>
          <p>Table #${order.tableId}</p>
          <p>${new Date(order.createdAt).toLocaleString()}</p>
          <table>
            ${orderLines}
          </table>
          <table class="summary">
            <tr><td>Subtotal</td><td style="text-align:right;">₹${order.subtotal.toFixed(2)}</td></tr>
            <tr><td>Service (5%)</td><td style="text-align:right;">₹${order.serviceCharge.toFixed(2)}</td></tr>
            <tr><td>GST/VAT (5%)</td><td style="text-align:right;">₹${order.tax.toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total</td><td style="text-align:right;">₹${order.total.toFixed(2)}</td></tr>
            <tr><td>Payment</td><td style="text-align:right;">${order.paymentMethod ?? 'Pending'}</td></tr>
          </table>
          <div class="footer">PREBILL COPY - NOT FINAL SETTLEMENT</div>
        </div>
      </body>
      </html>`;
  };

  const handlePrintMock = () => {
    if (!activeOrder) return;
    setShowPrintSpool(true);
    const printWindow = window.open('', 'PrebillPrint', 'width=420,height=640');
    if (printWindow) {
      printWindow.document.write(buildPrebillHtml(activeOrder));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    setTimeout(() => {
      setShowPrintSpool(false);
    }, 3500);
  };

  // Settle & release table
  const handleSettle = () => {
    if (!activeOrder) return;

    const settledTable = activeOrder.tableId;
    const settledTotal = activeOrder.total.toFixed(2);

    onSettleOrder(activeOrder.id, paymentMethod);
    setSuccessSettleMsg(`Table ${settledTable} settle successful! Bill of ₹${settledTotal} completed. Table is now vacated and released.`);
    setSelectedTable(null);
    setTimeout(() => {
      setSuccessSettleMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6" id="billing-station">
      {/* 1. Cashier Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Today Sales</span>
          <div className="mt-2 text-lg font-black text-slate-100 font-mono">₹{analytics.dailySales.toFixed(2)}</div>
          <div className="mt-3 text-[11px] text-slate-400">Paid orders processed today.</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Month Sales</span>
          <div className="mt-2 text-lg font-black text-slate-100 font-mono">₹{analytics.monthlySales.toFixed(2)}</div>
          <div className="mt-3 text-[11px] text-slate-400">All settled checks this month.</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Year Sales</span>
          <div className="mt-2 text-lg font-black text-slate-100 font-mono">₹{analytics.yearlySales.toFixed(2)}</div>
          <div className="mt-3 text-[11px] text-slate-400">This year’s cashier receipts.</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Net Sales</span>
          <div className="mt-2 text-lg font-black text-slate-100 font-mono">₹{stats.grossSales.toFixed(2)}</div>
          <div className="mt-3 text-[11px] text-slate-400">Total settled receipts in the system.</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Payment Mix</span>
          <div className="mt-2 text-slate-100 text-[12px] space-y-1">
            <div className="flex justify-between"><span>Cash</span><span>₹{analytics.cash.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Card</span><span>₹{analytics.card.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>UPI</span><span>₹{analytics.upi.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-none border border-slate-800">
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Storage</span>
          <div className="mt-2 text-lg font-black text-slate-100 font-mono">{inventory.totalUnits} units</div>
          <div className="mt-3 text-[11px] text-slate-400">Inventory value ₹{inventory.totalValue.toFixed(2)}</div>
          <div className="mt-3 text-[10px] text-slate-300 uppercase tracking-[0.18em] font-bold">Low stock</div>
          <div className="mt-1 text-[11px] text-slate-400 space-y-1">
            {inventory.lowStock.length > 0 ? inventory.lowStock.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.qty}</span>
              </div>
            )) : <div>No low stock items.</div>}
          </div>
        </div>
      </div>

      {/* 2. Billing Main Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table Selector Box */}
        <div className="lg:col-span-1 bg-slate-900 p-5 rounded-none border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between font-sans">
            <h3 className="font-sans font-black text-xs uppercase tracking-tight text-slate-100">01. TABLE INVOICES</h3>
            <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded-none font-mono font-bold">10 SLOTS</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tables.map(t => {
              const tableOrder = orders.find(o => o.tableId === t.number && !o.isPaid);
              const isSelected = selectedTable === t.number;
              
              let btnStyle = 'border-slate-850 hover:bg-slate-850 bg-slate-950 text-slate-400';
              if (tableOrder) {
                if (tableOrder.status === 'Ready') {
                  btnStyle = 'border-amber-700 bg-amber-950/40 text-amber-350 font-bold animate-pulse';
                } else if (tableOrder.status === 'Served') {
                  btnStyle = 'border-emerald-800 bg-emerald-950/20 text-emerald-400 font-bold';
                } else {
                  btnStyle = 'border-slate-700 bg-slate-800 text-slate-300 font-bold';
                }
              }

              if (isSelected) {
                btnStyle = 'bg-amber-600 border-amber-500 text-slate-950 font-extrabold';
              }

              return (
                <button
                  id={`btn-billing-table-${t.number}`}
                  key={t.number}
                  onClick={() => setSelectedTable(t.number)}
                  className={`p-3 rounded-none border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${btnStyle}`}
                >
                  <span className="text-[8px] uppercase tracking-wider font-mono font-bold opacity-75">Table</span>
                  <span className="text-lg font-bold font-mono">{t.number}</span>
                  {tableOrder && (
                    <span className="text-[8px] font-bold font-mono uppercase bg-slate-900 border border-slate-800 text-slate-200 rounded-none px-1 mt-1 truncate max-w-full">
                      ₹{tableOrder.total.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Receipt display & Process payment Box */}
        <div className="lg:col-span-2">
          {successSettleMsg && (
            <div className="mb-4 bg-green-955/30 border border-green-900/60 p-4 rounded-none text-xs text-green-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
              <span>{successSettleMsg}</span>
            </div>
          )}

          {/* Validation guard for empty tables! */}
          {selectedTable === null ? (
            <div className="bg-slate-900 p-10 rounded-none border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[350px]">
              <Receipt className="w-10 h-10 text-slate-600 mb-2" />
              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-slate-200">Waiting for Cashier Entry</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                Tap any table number box to retrieve active dining items, compute tax margins, and issue official restaurant receipts back.
              </p>
            </div>
          ) : !activeOrder ? (
            <div className="bg-slate-900 p-10 rounded-none border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[350px]" id="empty-table-warning">
              <div className="p-2.5 bg-slate-950 text-amber-300 rounded-none mb-3 border border-amber-700">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-amber-300 border-b border-amber-700/40 pb-1">Table Not Active</h4>
              <p className="text-xs text-slate-300 mt-3 max-w-sm bg-slate-950/80 p-3 rounded-none border border-slate-800 leading-relaxed text-center">
                <strong>Table {selectedTable}</strong> currently has no active unpaid order ticket. Select a table with an open order or create a new order first before compiling receipts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 p-5 rounded-none border border-slate-800">
              
              {/* Receipt mockup */}
              <div className="md:col-span-7 bg-slate-950 border border-slate-850 border-dashed p-4 rounded-none space-y-4" id="bill-receipt-mockup">
                <div className="text-center border-b border-dashed border-slate-800 pb-3 font-mono">
                  <h4 className="font-sans font-black text-sm tracking-widest text-slate-100 uppercase">ROYAL HARVEST CAFE</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">12TH AVE GOURMET BOULEVARD, SF</p>
                  <div className="flex items-center justify-between text-[10px] mt-3 uppercase font-bold text-slate-400">
                    <span>TBL #{activeOrder.tableId}</span>
                    <span>TKT: {activeOrder.id.split('_')[1]}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 text-left mt-0.5 font-mono">
                    DATE: {new Date(activeOrder.createdAt).toLocaleTimeString()} {new Date(activeOrder.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Bill ordered lines */}
                <div className="space-y-2 text-xs font-mono max-h-[220px] overflow-y-auto pr-1">
                  {activeOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center gap-2">
                      <div className="truncate max-w-[160px] uppercase text-slate-300">
                        <span>{it.quantity}X </span>
                        <span>{it.name}</span>
                      </div>
                      <span className="text-slate-400">₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Receipts breakdowns */}
                <div className="border-t border-dashed border-slate-800 pt-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>Subtotal</span>
                    <span>₹{activeOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px] uppercase">
                    <span>Service Chg (5.0%)</span>
                    <span>₹{activeOrder.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px] uppercase">
                    <span>State GST/VAT (5.0%)</span>
                    <span>₹{activeOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-amber-300 border-t border-dashed border-slate-800 pt-2 text-xs uppercase">
                    <span>NET CHARGE</span>
                    <span>₹{activeOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 font-mono text-[9px] text-slate-550 border-t border-dashed border-slate-800 uppercase">
                  <span>Cooked fresh with local love!</span>
                </div>
              </div>

              {/* Settle Panel */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="font-sans font-black text-[10px] uppercase tracking-wider text-slate-500 mb-3">02. Settle Gateway</h4>
                  
                  <div className="space-y-2">
                    <button
                      id="payment-card"
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`w-full p-2.5 rounded-none border flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'Card'
                          ? 'border-amber-500 bg-amber-600 text-slate-950 font-black'
                          : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Credit / Debit Card</span>
                    </button>

                    <button
                      id="payment-cash"
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`w-full p-2.5 rounded-none border flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'Cash'
                          ? 'border-amber-500 bg-amber-600 text-slate-950 font-black'
                          : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950'
                      }`}
                    >
                      <IndianRupee className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Cash Register Drawer</span>
                    </button>

                    <button
                      id="payment-upi"
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`w-full p-2.5 rounded-none border flex items-center gap-3 transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'border-amber-500 bg-amber-600 text-slate-950 font-black'
                          : 'border-slate-800 hover:border-slate-700 text-slate-300 bg-slate-950'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Contactless UPI QR</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {showPrintSpool && (
                    <div className="bg-slate-950 text-slate-100 p-2 text-[9px] font-mono leading-tight uppercase border border-slate-800 border-l-2 border-l-emerald-500 animate-pulse">
                      &gt; SPOOL_SPIDER_OK: Pushing table #{activeOrder.tableId} invoice to receipt spool register...
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono italic leading-normal p-2.5 bg-slate-950 border border-slate-850">
                    Status: <strong className="uppercase text-amber-500">{activeOrder.status}</strong>. Best settled when Order is <strong>Served</strong>.
                  </div>

                  <button
                    id="btn-settle-order"
                    onClick={handleSettle}
                    className="w-full py-2.5 bg-amber-600 text-slate-950 rounded-none font-sans font-black text-[10px] hover:bg-amber-500 transition-colors border border-amber-600 uppercase tracking-widest cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Settle Table {activeOrder.tableId}
                  </button>
                  
                  <button
                    id="btn-print-bill"
                    onClick={handlePrintMock}
                    className="w-full py-2 bg-slate-950 text-slate-350 rounded-none font-sans font-bold text-[10px] hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer uppercase tracking-wider"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Prebill Copy
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
