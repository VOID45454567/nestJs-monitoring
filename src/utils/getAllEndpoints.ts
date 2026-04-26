import { MachineConfig } from "@/conf/machines";
import { ServiceHealth } from "@/store/process.store";
import { EndpointExternalTestResult } from "@/types";

export const getAllEndpoints = (
    selectedMachine: MachineConfig,
    servicesHealth: Record<string, ServiceHealth>
) => {
    const results: EndpointExternalTestResult[] = [];

    selectedMachine.services.forEach(service => {
        const health = servicesHealth[service.id];
        if (health && Array.isArray(health.endpoints)) {
            health.endpoints.forEach(endpoint => {
                results.push({
                    serviceId: service.id,
                    serviceName: service.name,
                    processName: service.pm2_process_name,
                    name: endpoint.name,
                    url: endpoint.url,
                    method: "GET",
                    expected: endpoint.expected,
                    actual: endpoint.actual,
                    passed: endpoint.passed,
                    duration: endpoint.duration,
                });
            });
        } else {
            service.endpoints.forEach(endpoint => {
                results.push({
                    serviceId: service.id,
                    serviceName: service.name,
                    processName: service.pm2_process_name,
                    name: endpoint.name,
                    url: endpoint.url,
                    method: endpoint.method,
                    expected: endpoint.expected_status_code,
                    actual: "pending",
                    passed: false,
                    duration: 0,
                });
            });
        }
    });

    return results;
}