"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import { useWebSocketManager } from "@/hooks/useWebSocketManager";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function WebSocketInit() {
  useWebSocketManager();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketInit />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#252526",
            color: "#d4d4d4",
            border: "1px solid #3c3c3c",
          },
          success: {
            style: { background: "#1a2f1d", border: "1px solid #2e7d32" },
          },
          error: {
            style: { background: "#3a1e1e", border: "1px solid #d32f2f" },
          },
        }}
      />
    </QueryClientProvider>
  );
}