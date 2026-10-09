import { ClipboardDocumentCheckIcon, DocumentTextIcon, PlayIcon, UserPlusIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

import type { RequestService } from "../../../api/JobOrderManagement/requestServiceApi";
import type { Step, StepState } from "../../Shared/ServiceCards/ProgressStepper";

export const getRequestSteps = (service: RequestService): Step[] => {
    const jobOrder = service.job_order ?? null;
    const needsInspection = jobOrder?.requires_inspection ?? true;

    const items = [
        { key: "submitted", label: "Submitted", icon: DocumentTextIcon, at: service.created_at ?? "" },
        { key: "assigned", label: "Assigned", icon: UserPlusIcon, at: jobOrder?.created_at ?? null },
        {
            key: "inspected",
            label: needsInspection ? "Inspected" : "Ready",
            icon: ClipboardDocumentCheckIcon,
            at: jobOrder?.inspection?.inspected_at ?? (!needsInspection && jobOrder ? jobOrder.created_at ?? null : null),
        },
        { key: "working", label: "In progress", icon: PlayIcon, at: jobOrder?.start_job ?? null },
        {
            key: "completed",
            label: "Completed",
            icon: CheckBadgeIcon,
            at: jobOrder?.finish_job ?? (service.status === "completed" ? service.updated_at ?? "" : null),
        },
    ];

    const lastReached = items.reduce((last, item, index) => (item.at != null ? index : last), 0);
    const cancelled = service.status === "cancelled";

    return items.map((item, index) => {
        let state: StepState = "upcoming";
        if (index <= lastReached) state = "done";
        else if (index === lastReached + 1) state = cancelled ? "failed" : "current";
        return { ...item, state };
    });
};

export const requestProgress = (service: RequestService) => {
    if (service.status === "completed") return 100;
    if (service.job_order?.status === "in_progress") return service.job_order.progress ?? 0;
    return 0;
};

export const progressCaption = (service: RequestService) => {
    const jobOrder = service.job_order ?? null;

    if (service.status === "cancelled") return "This request was cancelled.";
    if (service.status === "completed") return "Work is done. Your vehicle is ready.";
    if (!jobOrder) return "Waiting for the shop to review your request.";
    if (jobOrder.status === "in_progress") return "The mechanic is working on your vehicle.";
    if (jobOrder.inspection?.result === "not_found" && !jobOrder.inspection.office_decision) return "No problem found during inspection. The shop will contact you.";
    if (jobOrder.inspection) return "Inspection done. Work will start soon.";
    if (jobOrder.requires_inspection === false) return "Scheduled. Work will start soon.";
    return "A mechanic is assigned and will inspect your vehicle first.";
};
