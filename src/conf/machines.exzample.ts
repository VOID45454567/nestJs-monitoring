import { APP_CONFIG } from "./machines";


// ============================================================
// conf/machines.example.ts
// ============================================================
//
// Пример конфигурации для PM2 Monitor
// Скопируйте этот файл как machines.ts и заполните своими данными
//
// ============================================================


export interface SMTPConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
    service?: 'gmail';
    tls?: {
        rejectUnauthorized: boolean;
    };
}

export interface MachineConfig {
    id: string;
    name: string;
    url: string;
    wsUrl: string;
    description?: string;
    adminEmail: string;
    checkIntervalMs: number;
    tags?: string[];
}

export interface AppConfig {
    machines: MachineConfig[];
    smtp: SMTPConfig;
    settings: {
        defaultCheckInterval: number;
        maxRetries: number;
        timeout: number;
        digestInterval: number;
    };
}

export const APP_CONFIG_EXZAMPLE: AppConfig = {
    smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: "your-email@gmail.com",
            pass: "your-app-password",
        },
        from: "PM2 Monitor <your-email@gmail.com>",
        tls: {
            rejectUnauthorized: false
        }
    },

    settings: {
        defaultCheckInterval: 15 * 60 * 1000,
        maxRetries: 3,
        timeout: 5000,
        digestInterval: 15 * 60 * 1000,
    },

    machines: [
        {
            id: 'local',
            name: 'Local Development',
            description: 'Локальный сервер разработки',
            url: 'http://localhost:3000',
            wsUrl: 'ws://localhost:3000',
            tags: ['development', 'local'],
            checkIntervalMs: 15 * 60 * 1000,
            adminEmail: 'kirillvasilev5817@gmail.com'
        },
        {
            id: 'staging',
            name: 'Staging Server',
            description: 'Тестовый сервер в локальной сети',
            url: 'http://192.168.1.178:3001',
            wsUrl: 'ws://192.168.1.178:3001',
            tags: ['staging', 'internal'],
            checkIntervalMs: 15 * 60 * 1000,
            adminEmail: 'kirillvasilev5817@gmail.com'

        },
        {
            id: 'production',
            name: 'Production Server',
            description: 'Продакшн сервер',
            url: 'http://10.0.0.50:3000',
            wsUrl: 'ws://10.0.0.50:3000',
            tags: ['production', 'critical'],
            checkIntervalMs: 10 * 60 * 1000,
            adminEmail: 'kirillvasilev5817@gmail.com'
        }
    ],
}

export const getMachineById = (id: string): MachineConfig | undefined => {
    return APP_CONFIG.machines.find(m => m.id === id);
};

export const MACHINES_CONFIG = APP_CONFIG.machines;
export const SMTP_CONFIG = APP_CONFIG.smtp;
export const APP_SETTINGS = APP_CONFIG.settings;