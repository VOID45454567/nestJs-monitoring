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

export interface EndpointCheckResult {
    passed: boolean;
    status: number | string;
    duration: number;
}