import { ServiceHealth } from "@/store/process.store";

export interface EndpointExternalTestResult {
    serviceId: string;
    serviceName: string;
    processName: string;
    name: string;
    url: string;
    method: string;
    expected: number;
    actual: number | string;
    passed: boolean;
    duration: number;
}

export const getAllEndpoints = (
    servicesHealth: Record<string, ServiceHealth>
): EndpointExternalTestResult[] => {
    const results: EndpointExternalTestResult[] = [];

    Object.values(servicesHealth).forEach(health => {
        if (health && Array.isArray(health.endpoints) && health.endpoints.length > 0) {
            health.endpoints.forEach(endpoint => {
                results.push({
                    serviceId: health.serviceId,
                    serviceName: health.processName,
                    processName: health.processName,
                    name: endpoint.name,
                    url: endpoint.url,
                    method: "GET",
                    expected: endpoint.expected,
                    actual: endpoint.actual,
                    passed: endpoint.passed,
                    duration: endpoint.duration,
                });
            });
        }
    });

    return results;
};