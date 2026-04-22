// config/machines.ts

export interface EndpointCheckConfig {
    name: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    expected_status_code: number;
    headers?: Record<string, string>;
    body?: any;
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
    description?: string;
    checkIntervalMs: number; // Интервал проверки эндпоинтов в миллисекундах
    endpoints: EndpointCheckConfig[];
    // Дополнительные настройки для машины
    tags?: string[];
    enabled?: boolean;
}

export interface AppConfig {
    machines: MachineConfig[];
    smtp: SMTPConfig;
    // Глобальные настройки приложения
    settings: {
        defaultCheckInterval: number; // 15 минут по умолчанию
        maxRetries: number;
        timeout: number;
        digestInterval: number; // Интервал отправки дайджеста
    };
}

// Экспортируем полный конфиг
export const APP_CONFIG: AppConfig = {
    // Настройки SMTP для Gmail
    smtp: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // false для порта 587, true для порта 465
        service: 'gmail',
        auth: {
            user: "void.noreply.test@gmail.com",
            pass: "atrd pzme zcmt fnab", // Пароль приложения Gmail (App Password)
        },
        from: "PM2 Monitor <void.noreply.test@gmail.com>",
        tls: {
            rejectUnauthorized: false
        }
    },

    // Глобальные настройки
    settings: {
        defaultCheckInterval: 15 * 60 * 1000, // 15 минут
        maxRetries: 3,
        timeout: 5000, // 5 секунд
        digestInterval: 15 * 60 * 1000, // 15 минут
    },

    // Конфигурация машин для мониторинга
    machines: [
        {
            id: 'local',
            name: 'Local Development',
            description: 'Локальный сервер разработки',
            url: 'http://localhost:3000',
            enabled: true,
            tags: ['development', 'local'],
            checkIntervalMs: 15 * 60 * 1000, // 15 минут
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://localhost:3000/api/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'API Status',
                    url: 'http://localhost:3000/api/status',
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
        },
        {
            id: 'staging',
            name: 'Staging Server',
            description: 'Тестовый сервер в локальной сети',
            url: 'http://192.168.1.100:3000',
            enabled: true,
            tags: ['staging', 'internal'],
            checkIntervalMs: 15 * 60 * 1000, // 15 минут
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://192.168.1.100:3000/api/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'PM2 Processes',
                    url: 'http://192.168.1.100:3000/api/pm2/processes',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'Test Summary',
                    url: 'http://192.168.1.100:3000/api/tests/summary',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
        },
        {
            id: 'production',
            name: 'Production Server',
            description: 'Продакшн сервер',
            url: 'http://10.0.0.50:3000',
            enabled: true,
            tags: ['production', 'critical'],
            checkIntervalMs: 10 * 60 * 1000, // 10 минут (более частые проверки для прода)
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://10.0.0.50:3000/api/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'API Status',
                    url: 'http://10.0.0.50:3000/api/status',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'PM2 Processes',
                    url: 'http://10.0.0.50:3000/api/pm2/processes',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'Metrics Endpoint',
                    url: 'http://10.0.0.50:3000/api/metrics',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'Test Validation',
                    url: 'http://10.0.0.50:3000/api/tests/validate',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
        },
        {
            id: 'backup',
            name: 'Backup Server',
            description: 'Резервный сервер',
            url: 'http://192.168.1.150:3000',
            enabled: false, // Отключен по умолчанию
            tags: ['backup', 'internal'],
            checkIntervalMs: 30 * 60 * 1000, // 30 минут
            endpoints: [
                {
                    name: 'Health Check',
                    url: 'http://192.168.1.150:3000/api/health',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'PM2 Processes',
                    url: 'http://192.168.1.150:3000/api/pm2/processes',
                    method: 'GET',
                    expected_status_code: 200,
                },
            ],
        },
        {
            id: 'remote-api',
            name: 'Remote API Server',
            description: 'Удаленный API сервер',
            url: 'https://api.example.com',
            enabled: true,
            tags: ['production', 'remote'],
            checkIntervalMs: 5 * 60 * 1000, // 5 минут
            endpoints: [
                {
                    name: 'API Health',
                    url: 'https://api.example.com/health',
                    method: 'GET',
                    expected_status_code: 200,
                    headers: {
                        'X-API-Key': 'your-api-key-here',
                    },
                },
                {
                    name: 'API Version',
                    url: 'https://api.example.com/version',
                    method: 'GET',
                    expected_status_code: 200,
                },
                {
                    name: 'Login Endpoint',
                    url: 'https://api.example.com/auth/login',
                    method: 'POST',
                    expected_status_code: 401, // Ожидаем 401 без credentials
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: {
                        username: 'test',
                        password: 'test',
                    },
                },
            ],
        },
    ],
};

// Вспомогательные функции для работы с конфигом
export const getEnabledMachines = (): MachineConfig[] => {
    return APP_CONFIG.machines.filter(m => m.enabled !== false);
};

export const getMachineById = (id: string): MachineConfig | undefined => {
    return APP_CONFIG.machines.find(m => m.id === id);
};

export const getMachinesByTag = (tag: string): MachineConfig[] => {
    return APP_CONFIG.machines.filter(m => m.tags?.includes(tag));
};

export const getDefaultMachine = (): MachineConfig => {
    return getEnabledMachines()[0] || APP_CONFIG.machines[0];
};

// Экспортируем отдельно для удобства
export const MACHINES_CONFIG = APP_CONFIG.machines;
export const SMTP_CONFIG = APP_CONFIG.smtp;
export const APP_SETTINGS = APP_CONFIG.settings;