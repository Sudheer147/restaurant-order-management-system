declare module 'react-dom/client' {
  export function createRoot(element: any): {
    render: (node: any) => void;
  };
}
