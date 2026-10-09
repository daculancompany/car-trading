import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import type { RequestService } from "../../../api/JobOrderManagement/requestServiceApi";

export const requestToJobOrder = (service: RequestService): JobOrder | null => {
    const jobOrder = service.job_order;
    if (!jobOrder) return null;

    const request = { ...service, job_order: undefined };

    return {
        ...jobOrder,
        assignedStaff: (jobOrder.assigned_staff as JobOrder["assignedStaff"]) ?? jobOrder.assignedStaff ?? null,
        partsUsed: jobOrder.parts_used ?? jobOrder.partsUsed ?? [],
        requestService: request as unknown as JobOrder["requestService"],
        vehicle: (jobOrder.vehicle ?? service.vehicle_release?.sale?.reservation?.vehicle) as JobOrder["vehicle"],
    };
};
