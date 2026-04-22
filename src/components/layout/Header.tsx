"use client";

import { useAppStore } from "@/store/app.store";
import { useMachineStore } from "@/store/machine.store";
import { useWebSocketStore } from "@/store/websocket.store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { storage } from "@/lib/storage";
import { sendTestEmail, validateSMTPConfig } from "@/lib/notification/email";
import { cn } from "@/utils/cn";

export const Header = () => {
  const { email, setEmail } = useAppStore();
  const { machines, selectedMachine, setSelectedMachine } = useMachineStore();
  const { status: wsStatus } = useWebSocketStore();

  const handleSaveEmail = () => {
    storage.setEmail(email);
    alert("Email saved!");
  };

  const handleTestEmail = async () => {
    if (!email) {
      alert("Please enter an email address first");
      return;
    }

    if (!validateSMTPConfig()) {
      alert("SMTP configuration is invalid");
      return;
    }

    const sent = await sendTestEmail(email);
    alert(sent ? "Test email sent!" : "Failed to send test email");
  };

  return (
    <header className="glass-effect p-4 mb-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gradient animate-gradient">
          PM2 Monitor
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={selectedMachine.id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedMachine(e.target.value)
            }
            options={machines.map((m) => ({ value: m.id, label: m.name }))}
            className="w-56"
          />

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "w-3 h-3 rounded-full animate-pulse-slow",
                wsStatus === "connected"
                  ? "bg-success-500 shadow-glow-success"
                  : "bg-error-500 shadow-glow-error",
              )}
            />
            <span className="text-sm text-text-secondary">{wsStatus}</span>
          </div>

          <div className="flex gap-3">
            <Input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Email for notifications"
              className="w-64"
            />
            <Button onClick={handleSaveEmail}>Save</Button>
            <Button variant="secondary" onClick={handleTestEmail}>
              Test Email
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
