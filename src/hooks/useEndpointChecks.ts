import { useEffect, useRef, useCallback, useState } from 'react';
import { useMachineStore } from '@/store/machine.store';
import { useAppStore } from '@/store/app.store';
import { createApiClient } from '@/lib/api/client';
import { storage } from '@/lib/storage';
import { sendEmail } from '@/lib/notification/email';
import { EndpointCheckResult } from '@/types';

export const useEndpointChecks = () => {
    const { selectedMachine } = useMachineStore();
    const { isClient } = useAppStore();
    const [checks, setChecks] = useState<Map<string, EndpointCheckResult>>(new Map());
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const runChecks = useCallback(async () => {
        if (!isClient) return;

        const api = createApiClient(selectedMachine);
        const newChecks = new Map(checks);
        const previousCache = storage.getEndpointCheckCache(selectedMachine.id);

        for (const endpoint of selectedMachine.endpoints) {
            const result = await api.checkEndpoint(endpoint);
            const cacheKey = `${endpoint.method}:${endpoint.url}`;
            const previousResult = previousCache.get(cacheKey);

            newChecks.set(cacheKey, result);

            if (previousResult && previousResult.passed !== result.passed) {
                const email = storage.getEmail();
                if (email) {
                    const subject = `[PM2 Monitor] Endpoint ${result.passed ? 'RECOVERED' : 'FAILED'} on ${selectedMachine.name}`;
                    const body = `
            <h2>Endpoint Status Change</h2>
            <p><strong>Machine:</strong> ${selectedMachine.name}</p>
            <p><strong>Endpoint:</strong> ${endpoint.name} (${endpoint.url})</p>
            <p><strong>Status:</strong> ${result.passed ? '✅ Recovered' : '❌ Failed'}</p>
            <p><strong>Response:</strong> ${result.status}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `;
                    await sendEmail(email, subject, body);
                }
            }
        }

        setChecks(newChecks);
        storage.setEndpointCheckCache(selectedMachine.id, newChecks);

        const failedEndpoints = Array.from(newChecks.entries())
            .filter(([_, result]) => !result.passed)
            .map(([key, result]) => {
                const endpoint = selectedMachine.endpoints.find(e => `${e.method}:${e.url}` === key);
                return { name: endpoint?.name || key, url: endpoint?.url || key, status: result.status };
            });

        storage.setLastTestResults(selectedMachine.id, {
            timestamp: new Date().toISOString(),
            failedEndpoints,
            totalEndpoints: selectedMachine.endpoints.length,
        });
    }, [selectedMachine, checks, isClient]);

    const startChecks = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(runChecks, selectedMachine.checkIntervalMs);
        setTimeout(runChecks, 5000);
    }, [selectedMachine.checkIntervalMs, runChecks]);

    const stopChecks = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
        }
    }, []);

    return { checks, runChecks, startChecks, stopChecks };
};