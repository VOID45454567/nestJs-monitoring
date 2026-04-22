import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketStore } from '@/store/websocket.store';
import { useMachineStore } from '@/store/machine.store';
import { useProcessStore } from '@/store/process.store';
import { useAppStore } from '@/store/app.store';
import { storage } from '@/lib/storage';
import { sendEmail, generateDownAlertBody } from '@/lib/notification/email';
import { createApiClient } from '@/lib/api/client';

export const useWebSocket = () => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const processStatusCache = useRef<Map<string, string>>(new Map());

    const { selectedMachine } = useMachineStore();
    const { status: wsStatus, setStatus } = useWebSocketStore();
    const { processes, setProcesses } = useProcessStore();
    const { isClient } = useAppStore();

    const fetchProcesses = useCallback(async () => {
        if (!isClient) return;
        try {
            const api = createApiClient(selectedMachine);
            const procs = await api.getProcesses();
            setProcesses(procs);
        } catch (err) {
            console.error('Failed to fetch processes:', err);
        }
    }, [selectedMachine, isClient, setProcesses]);

    const handleStatusChange = useCallback(async (data: { processName: string; newStatus: string; oldStatus: string }) => {
        const { processName, newStatus, oldStatus } = data;

        console.log('📊 Status change detected:', { processName, oldStatus, newStatus });

        processStatusCache.current.set(processName, newStatus);

        await fetchProcesses();

        if (newStatus === 'stopped' || newStatus === 'errored') {
            console.log(`🚨 Process ${processName} is DOWN!`);

            const notifiedDowns = storage.getNotifiedDowns(selectedMachine.id);
            console.log('📋 Already notified downs:', [...notifiedDowns]);

            if (!notifiedDowns.has(processName)) {
                const email = storage.getEmail();
                console.log('📧 Email for notifications:', email);

                if (!email) {
                    console.warn('⚠️ No email configured for notifications');
                    return;
                }

                console.log('📧 Preparing down alert email...');
                const subject = `[PM2 Monitor] ⚠️ ${processName} is DOWN on ${selectedMachine.name}`;
                const body = generateDownAlertBody(selectedMachine, processName, oldStatus, newStatus);

                console.log('📧 Sending down alert...');
                const sent = await sendEmail(email, subject, body);

                if (sent) {
                    storage.addNotifiedDown(selectedMachine.id, processName);
                    console.log(`✅ Down alert sent and recorded for ${processName}`);

                    if (typeof window !== 'undefined' && (window as any).showNotification) {
                        (window as any).showNotification(`Process ${processName} is DOWN!`, 'error');
                    }
                } else {
                    console.error(`❌ Failed to send down alert for ${processName}`);
                }
            } else {
                console.log(`Already notified about ${processName}, skipping`);
            }
        }

        if (newStatus === 'online') {
            const wasNotified = storage.getNotifiedDowns(selectedMachine.id).has(processName);
            if (wasNotified) {
                storage.clearNotifiedDown(selectedMachine.id, processName);
                console.log(`✅ Process recovered: ${processName}, cleared notification flag`);

                const email = storage.getEmail();
                if (email) {
                    const subject = `[PM2 Monitor] ✅ ${processName} is BACK ONLINE on ${selectedMachine.name}`;
                    const body = `
          <h2>✅ Process Recovered</h2>
          <p><strong>Machine:</strong> ${selectedMachine.name}</p>
          <p><strong>Process:</strong> ${processName}</p>
          <p><strong>Status:</strong> ${oldStatus} → ${newStatus}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `;
                    await sendEmail(email, subject, body);
                }
            }
        }
    }, [selectedMachine, fetchProcesses]);
    const connect = useCallback(() => {
        if (!isClient) {
            console.log('⏳ Waiting for client initialization...');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('✅ WebSocket already connected');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
            console.log('🔄 WebSocket connection in progress...');
            return;
        }

        try {
            // Правильное формирование WebSocket URL
            const baseUrl = selectedMachine.url;
            let wsUrl: string;

            if (baseUrl.startsWith('https://')) {
                wsUrl = baseUrl.replace('https://', 'wss://');
            } else if (baseUrl.startsWith('http://')) {
                wsUrl = baseUrl.replace('http://', 'ws://');
            } else {
                wsUrl = `ws://${baseUrl}`;
            }

            // Убираем /api из пути если он есть
            wsUrl = wsUrl.replace('/api', '');

            console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
            setStatus('connecting');

            const ws = new WebSocket(wsUrl);

            // Таймаут на подключение
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.error('❌ WebSocket connection timeout');
                    ws.close();
                    setStatus('error');
                }
            }, 10000);

            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                console.log(`✅ WebSocket connected to ${selectedMachine.name}`);
                setStatus('connected');
                reconnectAttemptsRef.current = 0;

                // Подписываемся на события
                const subscribeMessage = JSON.stringify({
                    event: 'subscribe',
                    data: { events: ['process:status:change', 'service:health:report'] },
                });

                console.log('📡 Sending subscription:', subscribeMessage);
                ws.send(subscribeMessage);

                // Отправляем пинг для проверки соединения
                ws.send(JSON.stringify({ event: 'ping' }));
            };

            ws.onmessage = (event) => {
                try {
                    console.log('📨 Received WebSocket message:', event.data);
                    const message = JSON.parse(event.data);

                    if (message.event === 'process:status:change') {
                        handleStatusChange(message.data);
                    } else if (message.event === 'service:health:report') {
                        console.log('🏥 Health report received:', message.data);
                    } else if (message.event === 'pong') {
                        console.log('💓 Pong received');
                    } else {
                        console.log('📋 Unknown event:', message.event);
                    }
                } catch (err) {
                    console.error('❌ WebSocket message parse error:', err);
                }
            };

            ws.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('❌ WebSocket error:', error);
                setStatus('error');
            };

            ws.onclose = (event) => {
                clearTimeout(connectionTimeout);
                console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason}`);
                setStatus('disconnected');
                wsRef.current = null;

                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

                    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
                    reconnectTimerRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                } else {
                    console.error('❌ Max reconnection attempts reached');
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('❌ WebSocket connection error:', error);
            setStatus('error');
        }
    }, [selectedMachine, isClient, setStatus, handleStatusChange]);

    const disconnect = useCallback(() => {
        console.log('🔌 Disconnecting WebSocket');
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = undefined;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        reconnectAttemptsRef.current = 0;
    }, []);

    // Автоподключение при изменении машины
    useEffect(() => {
        disconnect();
        if (isClient) {
            setTimeout(connect, 500);
        }
        return disconnect;
    }, [selectedMachine.id, isClient, connect, disconnect]);

    return { connect, disconnect, fetchProcesses };
};