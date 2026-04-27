'use client'

import { MachineSelector } from "@/components/dashboard/MachineSelector";
import { Header } from "@/components/layout/Header";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { ProcessList } from "@/components/dashboard/ProcessList";
import { ProcessDetails } from "@/components/dashboard/ProcessDetails";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Header />
        <MachineSelector />
        <StatusBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProcessList />
          </div>
          <div className="lg:col-span-2">
            <ProcessDetails />
          </div>
        </div>
      </div>
    </div>
  );
}