"use client";

import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
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
