"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app.store";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEndpointChecks } from "@/hooks/useEndpointChecks";
import { useNotifications } from "@/hooks/useNotifications";
import { Header } from "@/components/layout/Header";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { EndpointStatus } from "@/components/dashboard/EndpointStatus";
import { ProcessList } from "@/components/dashboard/ProcessList";
import { ProcessDetails } from "@/components/dashboard/ProcessDetails";

export default function HomePage() {
  const { setIsClient } = useAppStore();
  const { connect, disconnect } = useWebSocket();
  const { startChecks, stopChecks } = useEndpointChecks();
  const { startDigest, stopDigest } = useNotifications();

  useEffect(() => {
    setIsClient(true);
    connect();
    startChecks();
    startDigest();

    return () => {
      disconnect();
      stopChecks();
      stopDigest();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="container mx-auto p-6">
        <Header />
        <StatusBar />
        <EndpointStatus />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <ProcessList />
          <div className="lg:col-span-2">
            <ProcessDetails />
          </div>
        </div>
      </div>
    </div>
  );
}
