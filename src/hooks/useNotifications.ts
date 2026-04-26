import { useEffect, useRef, useCallback } from 'react';
import { useMachineStore } from '@/store/machine.store';
import { useProcessStore } from '@/store/process.store';
import { useAppStore } from '@/store/app.store';
import { storage } from '@/lib/storage';
import { sendEmail } from '@/lib/notification/email';
import { buildDigestBody, buildDigestSubject } from '@/lib/notification/email/getHtmlBody';

export const useNotifications = () => {
    const { selectedMachine } = useMachineStore();
    const { isClient } = useAppStore();
    const digestTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const sendDigest = useCallback(async () => {
        if (!isClient) return;

        const userEmail = storage.getEmail();
        if (!userEmail) return;

        const { processes } = useProcessStore.getState().getMachineData(selectedMachine.id);
        const downProcesses = processes.filter(p => p.status === 'stopped' || p.status === 'errored');
        const testResults = storage.getLastTestResults(selectedMachine.id);
        const failedEndpoints = testResults.failedEndpoints || [];

        if (downProcesses.length === 0 && failedEndpoints.length === 0) return;

        const subject = buildDigestSubject(selectedMachine.name);
        const body = buildDigestBody({
            machine: { id: selectedMachine.id, name: selectedMachine.name },
            downProcesses,
            failedEndpoints,
            testTimestamp: testResults.timestamp,
        });

        const sent = await sendEmail(userEmail, subject, body);
        if (sent) {
            storage.setLastDigestTime(selectedMachine.id, Date.now());
        }
    }, [selectedMachine.id, isClient]);

    const startDigest = useCallback(() => {
        if (digestTimerRef.current) clearInterval(digestTimerRef.current);
        digestTimerRef.current = setInterval(sendDigest, 15 * 60 * 1000);
    }, [sendDigest]);

    const stopDigest = useCallback(() => {
        if (digestTimerRef.current) {
            clearInterval(digestTimerRef.current);
            digestTimerRef.current = undefined;
        }
    }, []);

    return { sendDigest, startDigest, stopDigest };
};