export interface Process {
    id: number;
    name: string;
    pid: number;
    status: string;
    cpu: number;
    memory: number;
    uptime: number;
}

export interface HealthCheck {
    route: string;
    expected: number;
    method: string;
    result: number | string;
    success: boolean;
}

export interface HealthReport {
    name: string;
    pm2Status: string | undefined;
    checks: HealthCheck[];
    timestamp?: string;
}

export interface TestResult {
    service: {
        name: string;
        id: string;
        pm2ID: number;
    };
    pm2: {
        status: string;
        expected: string;
        passed: boolean;
    };
    endpoints: EndpointTest[];
    summary: {
        passed: number;
        failed: number;
        total: number;
    };
    timestamp: string;
    error?: string;
}

export interface EndpointTest {
    name: string;
    url: string;
    method: string;
    expected: number;
    actual: number | string;
    passed: boolean;
    duration: number;
}

export interface EndpointExternalTestResult extends EndpointTest {
    serviceId: string;
    serviceName: string;
    processName: string;
}

export interface EndpointCheckResult {
    passed: boolean;
    status: number | string;
    duration: number;
    timepstamp: string
}

export enum WSEventType {
    PROCESS_STATUS_CHANGE = 'process:status:change',
    ENDPOINT_HEALTH_CHANGE = 'endpoint:health:change',
    SERVICE_HEALTH_REPORT = 'service:health:report',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    APP_INIT = 'app:init',
    PROCESS_UPDATE = 'process:update',
}

export interface WSMessage<T = any> {
    event: WSEventType;
    data: T;
    timestamp: string;
    machineId?: string;
}