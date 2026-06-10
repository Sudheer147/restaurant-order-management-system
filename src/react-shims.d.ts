// Temporary shims to avoid TypeScript errors when node modules aren't installed
// These allow the project to type-check locally in editors without full installs.

declare module 'react' {
  const React: any;
  export default React;
  export function useState<T>(initialState: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
  export function useEffect(fn: (...args: any[]) => any, deps?: any[]): void;
  export function useMemo<T>(fn: () => T, deps: any[]): T;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function Fragment(props: any): any;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
}

declare module 'react-dom/client' {
  export function createRoot(el: any): { render: (v: any) => void };
}

declare module 'lucide-react' {
  export const Crown: any;
  export const Layers: any;
  export const Smartphone: any;
  export const ChefHat: any;
  export const Receipt: any;
  export const CreditCard: any;
  export const IndianRupee: any;
  export const CheckCircle: any;
  export const AlertCircle: any;
  export const Users: any;
  export const Trophy: any;
  export const Activity: any;
  export const Printer: any;
  export const UsersIcon: any;
  export const Plus: any;
  export const Minus: any;
  export const Trash2: any;
  export const Search: any;
  export const Utensils: any;
  export const AlertTriangle: any;
  export const Clock: any;
  export const Flame: any;
  export const Leaf: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

