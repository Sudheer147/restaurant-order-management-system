/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Type, 
  Palette, 
  Layers, 
  Grid, 
  MousePointerClick, 
  Sparkles, 
  Code, 
  Check, 
  Copy,
  Laptop
} from 'lucide-react';

export default function DesignSystem() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const colors = [
    { name: 'Obsidian Black (Background)', hex: '#030504', role: 'Main dark mode canvas background' },
    { name: 'Champagne Gold (Primary Accent)', hex: '#dfb750', role: 'Brand hero focus, primary button and highlight borders' },
    { name: 'Muted Gold (Secondary Accent)', hex: '#bda054', role: 'Secondary states, subtle focus outlines' },
    { name: 'Deep Charcoal (Surface / Panel)', hex: '#0a0f0d', role: 'Glassmorphic card bases, navigation backdrop' },
    { name: 'Light Gray (Foreground Text)', hex: '#f4f6f5', role: 'High readability primary body and headings' },
    { name: 'Muted Text (Opacity Guard)', hex: 'rgba(244, 246, 245, 0.65)', role: 'Subtle paragraph structures, timestamps' },
    { name: 'Gold Border (Soft Glow)', hex: 'rgba(223, 183, 80, 0.12)', role: 'Glassmorphic cards hairline strokes' },
  ];

  const typography = [
    { tag: 'h1', name: 'Display / Large Heading', font: 'Cormorant Garamond', weight: '600 / Semi-Bold', spacing: '-0.02em', size: 'clamp(2.5rem, 6vw, 4rem)', sample: 'The Art of Organic Gastronomy' },
    { tag: 'h2', name: 'Section Heading', font: 'Cormorant Garamond', weight: '500 / Medium', spacing: '-0.01em', size: 'clamp(2rem, 4.5vw, 2.75rem)', sample: 'Curated Seasonal Plates' },
    { tag: 'h3', name: 'Subsection Title', font: 'Cormorant Garamond', weight: '500 / Medium', spacing: 'Normal', size: 'clamp(1.35rem, 3vw, 1.8rem)', sample: 'Wine Estates Cellar Selection' },
    { tag: 'body', name: 'Body Paragraph Text', font: 'Plus Jakarta Sans', weight: '300 / Light', spacing: '0.01em', size: '0.9375rem / 15px', sample: 'Indulge in a premium farm-to-table culinary narrative. We craft seasonal, organic menus sourced straight from local fields and cook with artisanal passion in our estate kitchen.' },
    { tag: 'small', name: 'System Mono Labels', font: 'JetBrains Mono', weight: '500 / Medium', spacing: '0.12em', size: '0.75rem / 12px', sample: 'ORDER_STATUS: PREPARING_LINE' },
  ];

  const spacingScale = [
    { label: 'space-2 (xs)', px: '8px', widthClass: 'w-2', heightClass: 'h-2' },
    { label: 'space-4 (sm)', px: '16px', widthClass: 'w-4', heightClass: 'h-4' },
    { label: 'space-6 (md)', px: '24px', widthClass: 'w-6', heightClass: 'h-6' },
    { label: 'space-8 (lg)', px: '32px', widthClass: 'w-8', heightClass: 'h-8' },
    { label: 'space-12 (xl)', px: '48px', widthClass: 'w-12', heightClass: 'h-12' },
    { label: 'space-16 (xxl)', px: '64px', widthClass: 'w-16', heightClass: 'h-16' },
  ];

  const codeSnippets = {
    cssVariables: `:root {
  color-scheme: dark;
  --restaurant-black: #030504;
  --restaurant-surface: #0a0f0d;
  --restaurant-panel: #101613;
  --restaurant-border: rgba(223, 183, 80, 0.12);
  --restaurant-border-strong: rgba(223, 183, 80, 0.25);
  --restaurant-accent: #dfb750;
  --restaurant-accent-soft: rgba(223, 183, 80, 0.08);
  --restaurant-accent-strong: rgba(223, 183, 80, 0.2);
  --restaurant-foreground: #f4f6f5;
  --restaurant-muted: rgba(244, 246, 245, 0.65);
  
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --transition-smooth: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}`,
    fontImport: `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,750&display=swap');`,
    tailwindConfig: `/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        restaurant: {
          black: '#030504',
          surface: '#0a0f0d',
          accent: '#dfb750',
          border: 'rgba(223, 183, 80, 0.12)',
          muted: 'rgba(244, 246, 245, 0.65)',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  }
}`
  };

  return (
    <div className="bg-slate-900 rounded-none border border-slate-800 p-6 space-y-12 font-sans text-slate-100" id="design-system-showroom">
      
      {/* Brand Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-serif font-black text-amber-500 tracking-tight flex items-center gap-2.5 uppercase">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Royal Harvest Premium Design System
        </h2>
        <p className="text-slate-400 text-xs mt-1 max-w-3xl leading-relaxed">
          The aesthetic foundation of Royal Harvest: a luxury-grade, minimal digital design language inspired by high-end estate hospitality. Contrasting fine serif lettering with modern spacious sans-serif layouts.
        </p>
      </div>

      {/* 1. TYPOGRAPHY SYSTEM */}
      <section className="space-y-6" id="ds-typography">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Type className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">1. Typography System & Contrast Pairing</h3>
        </div>
        
        <p className="text-xs text-slate-400 max-w-3xl">
          We establish a classic luxury serif for major display headings, coupled with a highly clean sans-serif built with warm geometry for body descriptions, ensuring clean premium readability.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {typography.map((t) => (
              <div key={t.tag} className="p-4 bg-slate-950 border border-slate-850 rounded-none space-y-2">
                <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-mono border-b border-slate-900 pb-1.5 uppercase">
                  <span>{t.name} (<code>&lt;{t.tag}&gt;</code>)</span>
                  <span>Font: {t.font} • Weight: {t.weight} • Space: {t.spacing}</span>
                </div>
                {t.tag === 'h1' && <h1 className="text-slate-100 mt-1" style={{ letterSpacing: t.spacing }}>{t.sample}</h1>}
                {t.tag === 'h2' && <h2 className="text-slate-100 mt-1" style={{ letterSpacing: t.spacing }}>{t.sample}</h2>}
                {t.tag === 'h3' && <h3 className="text-slate-100 mt-1" style={{ letterSpacing: t.spacing }}>{t.sample}</h3>}
                {t.tag === 'body' && <p className="text-slate-300 mt-1" style={{ letterSpacing: t.spacing }}>{t.sample}</p>}
                {t.tag === 'small' && <p className="font-mono text-xs text-slate-400 tracking-wider mt-1">{t.sample}</p>}
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/10 rounded-none space-y-4">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold block">Contrast Demonstration</span>
              <div className="space-y-3">
                <h2 className="font-serif text-3xl leading-tight text-slate-100">Estate Woodfired Cooking</h2>
                <div className="h-px w-12 bg-amber-500/40"></div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  We slow-braise ingredients over fresh wood embers, locking in natural botanical juices and crafting smoky caramelization that reflects local farm estates.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-none text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300">Design Recommendations:</span>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>Tight letter-spacing (<code className="text-amber-400 font-mono">-0.02em</code>) on headers creates high-fashion impact.</li>
                <li>Relaxed line height (<code className="text-amber-400 font-mono">1.65</code>) on body text maintains reading comfort on dark canvases.</li>
                <li>Never mix more than two display weights in a single section.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COLOR PALETTE */}
      <section className="space-y-6" id="ds-colors">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Palette className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">2. Luxury Color Palette System</h3>
        </div>

        <p className="text-xs text-slate-400 max-w-3xl">
          An ultra-premium minimal palette. Deep black charcoal backgrounds create high contrast with premium champagne gold leaf indicators. Hover on any color swatch to copy its HEX value.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {colors.map((c, i) => (
            <div key={i} className="bg-slate-950 border border-slate-850 p-4 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all group">
              <div 
                className="h-24 w-full border border-slate-900 group-hover:scale-[1.02] transition-transform duration-300 relative cursor-pointer"
                style={{ backgroundColor: c.hex.startsWith('#') ? c.hex : '#000' }}
                onClick={() => copyToClipboard(c.hex, c.name)}
              >
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">
                  Click to Copy
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-200">{c.name}</span>
                  <button 
                    onClick={() => copyToClipboard(c.hex, c.name)}
                    className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                    title="Copy HEX"
                  >
                    {copiedText === c.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-amber-500 font-mono text-xs block font-bold">{c.hex}</code>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. UI COMPONENTS */}
      <section className="space-y-6" id="ds-components">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">3. Interactive UI Components</h3>
        </div>

        <p className="text-xs text-slate-400 max-w-3xl">
          Standardized interactive states for restaurant buttons and glassmorphic cards. Click button previews to feel the smooth micro-scale and transitions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Buttons preview */}
          <div className="bg-slate-950 p-6 border border-slate-850 rounded-none space-y-6">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 font-bold">Interactive Button States</h4>
            
            <div className="space-y-4">
              {/* Primary button */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-900/50">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-200 font-bold block">Primary Button</span>
                  <span className="text-[10px] text-slate-500 font-mono">.btn-primary</span>
                </div>
                <button className="btn-primary">Book A Table</button>
              </div>

              {/* Secondary button */}
              <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-900/50">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-200 font-bold block">Secondary Outline</span>
                  <span className="text-[10px] text-slate-500 font-mono">.btn-secondary</span>
                </div>
                <button className="btn-secondary">Explore Menu</button>
              </div>

              {/* Ghost button */}
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-200 font-bold block">Ghost Underlined</span>
                  <span className="text-[10px] text-slate-500 font-mono">.btn-ghost</span>
                </div>
                <button className="btn-ghost">View Cart</button>
              </div>
            </div>
          </div>

          {/* Cards & Image Zoom */}
          <div className="bg-slate-950 p-6 border border-slate-850 rounded-none space-y-6">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 font-bold">Specials Cards & Image Zoom</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4 flex flex-col justify-between min-h-[260px] group">
                <div className="space-y-3">
                  <div className="zoom-img-container h-28 rounded border border-amber-500/10 bg-slate-900 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80" 
                      alt="Sample Dish" 
                      className="zoom-img opacity-85" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <h5 className="font-serif font-black text-slate-200 text-xs uppercase tracking-wide group-hover:text-amber-400 transition-colors">Tandoori Lamb</h5>
                      <span className="text-[11px] font-mono text-amber-500 font-bold">₹640</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans font-light line-clamp-2">
                      Local free-range lamb chops marinated in artisanal spices and slow-broiled in our copper tandoor pit.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[8px] font-mono uppercase text-slate-500">
                  <span>Chef Special</span>
                  <span>15 min prep</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-400 leading-relaxed p-2">
                <strong className="text-slate-200 block text-[11px] uppercase tracking-wide">UX Behavior Specifications:</strong>
                <ul className="list-disc pl-4 space-y-1.5 text-[10px]">
                  <li><span className="text-slate-300 font-bold">Card blur:</span> Applied via CSS backdrop filters (<code className="text-amber-500">blur(12px)</code>) for depth layer separations.</li>
                  <li><span className="text-slate-300 font-bold">Micro-scale:</span> Containers scale outwards by <code className="text-amber-500">4%</code> on card image hover.</li>
                  <li><span className="text-slate-300 font-bold">Transitions:</span> 350ms ease-in-out curve ensures visual flow.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPACING, GRID & VISUAL STYLE */}
      <section className="space-y-6" id="ds-spacing">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Grid className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">4. Spacing & Visual Style Guidelines</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Spacing visualizer */}
          <div className="bg-slate-950 p-6 border border-slate-850 rounded-none space-y-6">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 font-bold">8px Spacing scale</h4>
            
            <div className="space-y-3">
              {spacingScale.map((s, i) => (
                <div key={i} className="flex items-center gap-4 text-xs font-mono">
                  <div className="w-24 text-slate-400">{s.label}</div>
                  <div className="w-12 text-amber-500 font-bold">{s.px}</div>
                  <div className="flex-1 bg-slate-900 border border-slate-850 h-5 flex items-center px-1">
                    <div className={`bg-amber-500/20 border border-amber-500/40 h-3 ${s.widthClass}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aesthetic guidelines */}
          <div className="bg-slate-950 p-6 border border-slate-850 rounded-none space-y-4 text-xs text-slate-400">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 font-bold">Luxury Background & Visual Mood</h4>
            
            <div className="space-y-3 leading-relaxed">
              <p>
                <strong className="text-slate-200 block text-[11px] uppercase tracking-wide mb-0.5">Matte Luxury Atmosphere</strong>
                Avoid glossy plastics or high-intensity bright gradients. Backgrounds should behave like rich matte surfaces with radial gradient highlights.
              </p>
              <p>
                <strong className="text-slate-200 block text-[11px] uppercase tracking-wide mb-0.5">Section Breathing Room</strong>
                Use generous vertical spacing (<code className="text-amber-500 font-mono">padding-top: 7rem</code>) to give components room to express elegance. Cluttered pages look low-budget.
              </p>
              <p>
                <strong className="text-slate-200 block text-[11px] uppercase tracking-wide mb-0.5">Linen/Lace Textures</strong>
                Incorporate fine grain patterns, linen structures or vector micro-gradients rather than heavy pictures or flat solid slate gray blocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEVELOPER CODE CODE-BLOCKS */}
      <section className="space-y-6" id="ds-code">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Code className="w-4.5 h-4.5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">5. Developer Code Snippets</h3>
        </div>

        <p className="text-xs text-slate-400 max-w-3xl">
          Standardized code blocks to drop directly into production web applications. Click copy icons to extract code snippets instantly.
        </p>

        <div className="space-y-6">
          {/* CSS Variables */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">1. CSS variables (`index.css`)</span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.cssVariables, 'cssVariables')}
                className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 hover:text-amber-400 hover:border-amber-500/40 rounded transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                {copiedText === 'cssVariables' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Snippet</>}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 border border-slate-850 font-mono text-[11px] text-slate-300 overflow-x-auto rounded leading-relaxed">
{codeSnippets.cssVariables}
            </pre>
          </div>

          {/* Google Font Imports */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">2. Google Font Imports</span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.fontImport, 'fontImport')}
                className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 hover:text-amber-400 hover:border-amber-500/40 rounded transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                {copiedText === 'fontImport' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Snippet</>}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 border border-slate-850 font-mono text-[11px] text-slate-300 overflow-x-auto rounded leading-relaxed">
{codeSnippets.fontImport}
            </pre>
          </div>

          {/* Tailwind Config */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">3. Tailwind Configuration Setup</span>
              <button 
                onClick={() => copyToClipboard(codeSnippets.tailwindConfig, 'tailwindConfig')}
                className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400 hover:text-amber-400 hover:border-amber-500/40 rounded transition-all cursor-pointer font-bold uppercase tracking-wider"
              >
                {copiedText === 'tailwindConfig' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Snippet</>}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 border border-slate-850 font-mono text-[11px] text-slate-300 overflow-x-auto rounded leading-relaxed">
{codeSnippets.tailwindConfig}
            </pre>
          </div>
        </div>
      </section>

    </div>
  );
}
