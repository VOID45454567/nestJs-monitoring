import { APP_CONFIG } from "./machines";


// ============================================================
// conf/machines.example.ts
// ============================================================
//
// Пример конфигурации для PM2 Monitor
// Скопируйте этот файл как machines.ts и заполните своими данными
//
// ============================================================


export interface EndpointCheckConfig {
    name: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    expected_status_code: number;
    headers?: Record<string, string>;
    body?: any;
}

export interface ServiceConfig {
    id: string;
    name: string;
    pm2ID: number;
    pm2_process_name: string;
    endpoints: EndpointCheckConfig[];
    logs?: {
        alert_on_error_patterns?: string[];
    };
    application_status: {
        expected_status: string;
    };
}

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
    checkIntervalMs: number;
    endpoints: EndpointCheckConfig[];
    services: ServiceConfig[];
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
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://localhost:3000/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'PM2 Processes',
                    url: 'http://localhost:3000/api/pm2/processes',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'Monitoring Status',
                    url: 'http://localhost:3000/api/monitoring/status',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
            services: [
                {
                    pm2ID: 0,
                    id: 'server-one',
                    name: 'Server One',
                    pm2_process_name: 'server-one',
                    application_status: {
                        expected_status: "online"
                    },
                    logs: {
                        alert_on_error_patterns: ['ECONNREFUSED', 'FATAL ERROR']
                    },
                    endpoints: [
                        {
                            name: 'Main Page',
                            url: 'http://localhost:3005/api/main',
                            method: 'GET',
                            expected_status_code: 200,
                        },
                        {
                            name: 'Status Check',
                            url: 'http://localhost:3005/server-status',
                            method: 'GET',
                            expected_status_code: 200,
                        }
                    ]
                },
                {
                    pm2ID: 1,
                    id: 'server-two',
                    name: 'Server Two',
                    pm2_process_name: 'server-two',
                    application_status: {
                        expected_status: "online"
                    },
                    logs: {
                        alert_on_error_patterns: ['ECONNREFUSED', 'FATAL ERROR']
                    },
                    endpoints: [
                        {
                            name: 'Main Page',
                            url: 'http://localhost:3006',
                            method: 'GET',
                            expected_status_code: 200,
                        },
                        {
                            name: 'Error Page',
                            url: 'http://localhost:3006/error',
                            method: 'GET',
                            expected_status_code: 200,
                        },
                        {
                            name: 'Status Check',
                            url: 'http://localhost:3006/status',
                            method: 'GET',
                            expected_status_code: 200,
                        }
                    ]
                }
            ]
        },
        {
            id: 'staging',
            name: 'Staging Server',
            description: 'Тестовый сервер в локальной сети',
            url: 'http://192.168.1.100:3000/health',
            wsUrl: 'http://192.168.1.100:3000/health',
            tags: ['staging', 'internal'],
            checkIntervalMs: 15 * 60 * 1000,
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://192.168.1.100:3000/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'PM2 Processes',
                    url: 'http://192.168.1.100:3000/api/pm2/processes',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
            services: []
        },
        {
            id: 'production',
            name: 'Production Server',
            description: 'Продакшн сервер',
            url: 'http://10.0.0.50:3000',
            wsUrl: 'ws://10.0.0.50:3000',
            tags: ['production', 'critical'],
            checkIntervalMs: 10 * 60 * 1000,
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://10.0.0.50:3000/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'API Status',
                    url: 'http://10.0.0.50:3000/',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
            services: []
        }
    ],
}

export const getMachineById = (id: string): MachineConfig | undefined => {
    return APP_CONFIG.machines.find(m => m.id === id);
};

export const MACHINES_CONFIG = APP_CONFIG.machines;
export const SMTP_CONFIG = APP_CONFIG.smtp;
export const APP_SETTINGS = APP_CONFIG.settings;