import { useEffect, useRef, useCallback } from 'react';
import { useMachineStore } from '@/store/machine.store';
import { useProcessStore } from '@/store/process.store';
import { useAppStore } from '@/store/app.store';
import { storage } from '@/lib/storage';
import { sendEmail, generateDigestBody } from '@/lib/notification/email';

export const useNotifications = () => {
    const { selectedMachine } = useMachineStore();
    const { processes } = useProcessStore();
    const { isClient } = useAppStore();
    const digestTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const sendDigest = useCallback(async () => {
        if (!isClient) return;

        const userEmail = storage.getEmail();
        if (!userEmail) return;

        const currentDowns = storage.getNotifiedDowns(selectedMachine.id);
        const downProcesses = processes.filter(p => p.status === 'stopped' || p.status === 'errored');
        const newDowns = downProcesses.filter(p => !currentDowns.has(p.name));

        newDowns.forEach(p => storage.addNotifiedDown(selectedMachine.id, p.name));

        const testResults = storage.getLastTestResults(selectedMachine.id);
        const failedEndpoints = testResults.failedEndpoints || [];

        if (newDowns.length === 0 && failedEndpoints.length === 0) {
            console.log('No issues to report in digest');
            return;
        }

        const subject = `[PM2 Monitor] ${selectedMachine.name} - Digest ${new Date().toLocaleString()}`;
        const body = generateDigestBody(selectedMachine, newDowns, failedEndpoints, testResults.timestamp);

        const sent = await sendEmail(userEmail, subject, body);
        if (sent) {
            storage.setLastDigestTime(selectedMachine.id, Date.now());
            console.log('Digest sent successfully');
        }
    }, [selectedMachine, processes, isClient]);

    const startDigest = useCallback(() => {
        if (digestTimerRef.current) clearInterval(digestTimerRef.current);
        digestTimerRef.current = setInterval(sendDigest, 15 * 60 * 1000); // 15 минут
    }, [sendDigest]);

    const stopDigest = useCallback(() => {
        if (digestTimerRef.current) {
            clearInterval(digestTimerRef.current);
            digestTimerRef.current = undefined;
        }
    }, []);

    return { sendDigest, startDigest, stopDigest };
};