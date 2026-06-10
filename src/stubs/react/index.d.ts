declare module 'react' {
  export type DependencyList = readonly any[];
  export type ReactNode = any;
  export type PropsWithChildren<P> = P & { children?: ReactNode };

  export function useState<S>(initialState: S | (() => S)):
    [S, (value: S | ((prevState: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: DependencyList): void;
  export function useMemo<T>(factory: () => T, deps: DependencyList): T;

  export const Fragment: any;
  export type FormEvent = { preventDefault(): void; [key: string]: any };
  export type ChangeEvent<T = any> = { target: T; [key: string]: any };
  const React: any;
  export default React;
}
