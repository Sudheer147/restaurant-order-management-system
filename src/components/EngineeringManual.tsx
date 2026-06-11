/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  Database, 
  Workflow, 
  GitMerge, 
  Activity, 
  ShieldAlert, 
  Layers,
  Server,
  Code
} from 'lucide-react';

export default function EngineeringManual() {
  return (
    <div className="bg-slate-900 rounded-none border border-slate-800 p-6 space-y-8 font-sans text-slate-100" id="engineering-manual">
      
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-lg font-black text-amber-500 tracking-tight flex items-center gap-2.5 uppercase">
          <BookOpen className="w-5 h-5 text-amber-500" />
          Royal Harvest: System Architecture & Operations Manual
        </h2>
        <p className="text-slate-400 text-[11px] mt-1 max-w-2xl leading-relaxed">
          Comprehensive, stakeholder-ready documentation outlining our system topology, data structures, integration interfaces, CI/CD pipeline structures, and live monitoring plans.
        </p>
      </div>

      {/* Grid of Contents */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="xl:col-span-3 space-y-2">
          <div className="bg-slate-950 p-4 rounded-none border border-slate-850 space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Technical Guide Index</h4>
            <nav className="space-y-1">
              <a href="#section-arch" className="sidebar-link">
                System Architecture
              </a>
              <a href="#section-schema" className="sidebar-link">
                Data Schema Def
              </a>
              <a href="#section-api" className="sidebar-link">
                API Integration
              </a>
              <a href="#section-cicd" className="sidebar-link">
                CI/CD Pipelines
              </a>
              <a href="#section-monitor" className="sidebar-link">
                Live Monitoring
              </a>
            </nav>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="xl:col-span-9 space-y-10">
          
          {/* Section 1: Architecture */}
          <section id="section-arch" className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-tight text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-slate-400" />
              1. System Architecture Design
            </h3>
            
            <p className="text-[11px] text-slate-350 leading-relaxed">
              Our proposed production model utilizes a decoupled, resilient, **three-pane service model** to bridge physical and digital restaurant domains. This ensures that a local high-traffic period does not throttle transactional capabilities.
            </p>

            {/* Architecture diagram ascii */}
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-none font-mono text-[9px] border border-slate-850 whitespace-pre overflow-x-auto leading-normal">
{`+-------------------------------------------------------------+
|                     1. WAITER TABLET                        |
|   - Selects Tables 1-10    - Configures Cart                |
|   - Real-time stock checks - Pushes ticket to KDS           |
+------------------------------+------------------------------+
                               |
                        [HTTP POST Ticket]
                                v
+------------------------------+------------------------------+
|                    2. SYSTEM CLOUD CONTROL                   |
|   - Central Order Controller  - Event Hub Broker            |
|   - Menu Database Repository  - Persistent Storage Hub       |
+------------------------------+------------------------------+
                               |
                        [Websocket Broadcast]
                                v
+------------------------------+------------------------------+
|                   3. KITCHEN DISPLAY VIEW                    |
|   - Instant ticking visualizer  - Prep status trackers       |
|   - Dynamic Delay Warn Alerts  - Item completion controls   |
+------------------------------+------------------------------+
                               |
                        [HTTP Settle Action]
                                v
+------------------------------+------------------------------+
|                     4. CASHIER TERMINAL                      |
|   - Computes VAT & Service Chg - Generates PDF Receipts     |
|   - Processes QR/Card Settle    - Flushes / Vacates Tables  |
+-------------------------------------------------------------+`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] mt-3">
              <div className="p-3.5 bg-slate-955 border border-slate-850 rounded-none">
                <strong className="text-slate-100 font-sans font-bold text-xs uppercase tracking-tight block mb-1">Edge Device Resilience</strong>
                The Client stations execute optimistic storage updates. If local area network Wi-Fi experiences micro-outages, terminals cache orders instantly inside offline IndexedDB registries, and synchronize immediately once signal returns.
              </div>
              <div className="p-3.5 bg-slate-955 border border-slate-850 rounded-none">
                <strong className="text-slate-100 font-sans font-bold text-xs uppercase tracking-tight block mb-1">Concurrency Strategy</strong>
                A write-ahead-logging lock prevents double table booking. Once Table A initiates a waiter session, KDS and Cashier views register 'Busy' lock flags, protecting table isolation.
              </div>
            </div>
          </section>

          {/* Section 2: Data Schema */}
          <section id="section-schema" className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-tight text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Database className="w-4 h-4 text-slate-400" />
              2. Precise Data Schema definition
            </h3>

            <p className="text-[11px] text-slate-350 leading-relaxed">
              We define strong, standardized schemas to ensure transaction immutability. Below are database mapping constraints:
            </p>

            <div className="bg-slate-950 p-4 rounded-none border border-slate-855 space-y-3 font-mono text-[9px]">
              <div>
                <span className="text-amber-500 font-black block mb-1 uppercase tracking-wider">// 1. MenuItem Schema</span>
                <pre className="text-slate-300 bg-slate-900 p-2.5 rounded-none border border-slate-850 text-[10px]">
{`{
  id: string;          // e.g. "item_1"
  name: string;        // e.g. "Paneer Tikka"
  category: string;    // "Starters" | "Main Course" | ...
  price: number;       // float precision
  prepTime: number;    // estimated cooking duration (minutes)
  available: boolean;  // catalog toggle
  description: string; // chef recipe descriptor
}`}
                </pre>
              </div>

              <div>
                <span className="text-amber-500 font-black block mb-1 uppercase tracking-wider">// 2. Order Schema</span>
                <pre className="text-slate-300 bg-slate-900 p-2.5 rounded-none border border-slate-850 text-[10px]">
{`{
  id: string;          // format: "ord_[timestamp]_[table]"
  tableId: number;     // bounded range (1-10)
  items: OrderItem[];  // array of lines
  status: string;      // "Ordered" | "Preparing" | "Ready" | "Served"
  createdAt: string;   // ISO 8601 formatting
  isPaid: boolean;     // billing lockout
  subtotal: number;    // cumulative sum
  tax: number;         // GST at 5.0%
  serviceCharge: number; // service at 5.0%
  total: number;       // grand cash sum
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 3: API Integration Strategy */}
          <section id="section-api" className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-tight text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-slate-400" />
              3. API Integration Strategy
            </h3>

            <p className="text-[11px] text-slate-350 leading-relaxed">
              The communication layers execute over simple REST API resources alongside lightweight WebSocket subscriptions. Below are our key operational endpoints:
            </p>

            <div className="overflow-x-auto border border-slate-800 rounded-none">
              <table className="w-full text-left text-xs pb-1">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[9px] text-slate-400 font-semibold uppercase">
                    <th className="p-2.5">Endpoint</th>
                    <th className="p-2.5">Verb</th>
                    <th className="p-2.5">Payload Context</th>
                    <th className="p-2.5">Gateway Event Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-[10px]">
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-100">/api/menu</td>
                    <td className="p-2.5"><span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase tracking-wider">GET</span></td>
                    <td className="p-2.5 text-slate-400">None</td>
                    <td className="p-2.5 text-slate-300">Retrieves full 30-item menu catalog dataset</td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-100">/api/orders</td>
                    <td className="p-2.5"><span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase tracking-wider">GET</span></td>
                    <td className="p-2.5 text-slate-400">Filters: isPaid, tableId</td>
                    <td className="p-2.5 text-slate-300">Retrieves central active order histories</td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-100">/api/orders</td>
                    <td className="p-2.5"><span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase tracking-wider">POST</span></td>
                    <td className="p-2.5 text-slate-400">{"{ tableId, items, notes }"}</td>
                    <td className="p-2.5 text-slate-300">Creates new active ticket, alerts KDS monitor</td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-100">/api/orders/:id/status</td>
                    <td className="p-2.5"><span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase tracking-wider">PUT</span></td>
                    <td className="p-2.5 text-slate-400">{"{ status: 'Preparing'|'Ready' }"}</td>
                    <td className="p-2.5 text-slate-300">Updates general ticket; alerts waiter terminal</td>
                  </tr>
                  <tr className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-100">/api/orders/:id/settle</td>
                    <td className="p-2.5"><span className="bg-amber-600 text-slate-950 px-1.5 py-0.5 rounded-none text-[8px] font-mono font-black uppercase tracking-wider">PUT</span></td>
                    <td className="p-2.5 text-slate-400">{"{ paymentMethod: 'Card'|'UPI' }"}</td>
                    <td className="p-2.5 text-slate-300">Locks in sales revenue, frees up table slot</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: CI/CD Pipelines */}
          <section id="section-cicd" className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-tight text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
              <GitMerge className="w-4 h-4 text-slate-400" />
              4. Automated CI/CD Pipelines
            </h3>

            <p className="text-[11px] text-slate-350 leading-relaxed">
              We leverage an **automated GitOps pipeline** configured in GitHub Actions to secure staging and production parity. This pipeline operates as follows:
            </p>

            <div className="bg-slate-950 p-4 rounded-none border border-slate-850 text-[11px] text-slate-400 leading-normal space-y-2">
              <p>
                <strong className="text-amber-500 font-bold block mb-1">Step 1: Test & Clean Linting (Pre-flight Checks)</strong>
                Every pull request triggers `npm run lint` and unit test scripts. If types are broken, development builds fail.
              </p>
              <p>
                <strong className="text-amber-500 font-bold block mb-1">Step 2: Micro-containerization & Build</strong>
                Docker packages the compiled React build (production optimized files served with safe server layer paths) into isolated, un-privileged structures.
              </p>
              <p>
                <strong className="text-amber-500 font-bold block mb-1">Step 3: Serverless Deployment with Secrets Guard</strong>
                GitHub secrets automatically deploy updated codebases to secure environments in Google Cloud Run.
              </p>
            </div>
          </section>

          {/* Section 5: Monitoring */}
          <section id="section-monitor" className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-tight text-amber-500 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-slate-400" />
              5. Live Monitoring & Alerting Plan
            </h3>

            <p className="text-[11px] text-slate-350 leading-relaxed">
              A high-availability order system requires close monitoring of user actions and performance times. We manage this through several specialized alert channels:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-none space-y-1">
                <span className="font-sans font-black text-slate-200 text-[10px] uppercase tracking-wide block">KITCHEN COOKING LAG</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Alert triggers if any active food ticket remains unfinished in KDS for over 18 minutes.</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-none space-y-1">
                <span className="font-sans font-black text-slate-200 text-[10px] uppercase tracking-wide block">STOCK PRESSURE WARN</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Warns waiter console if critical items (e.g., butter chicken) fall below 2 portions remaining.</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-none space-y-1">
                <span className="font-sans font-black text-slate-200 text-[10px] uppercase tracking-wide block font-bold">TRANSACTION ANOMALIES</span>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Alerts register desk if manual checkout overrides exceed standard 15% discount thresholds.</p>
              </div>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
