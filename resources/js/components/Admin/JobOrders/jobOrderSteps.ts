import { CheckBadgeIcon, ClipboardDocumentCheckIcon, PlayIcon, UserPlusIcon } from "@heroicons/react/24/outline";

import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import type { Step, StepState } from "../../Shared/ServiceCards/ProgressStepper";
import { getInspectionState } from "./jobOrderHelpers";

export const getJobOrderSteps = (jobOrder: JobOrder): Step[] => {
    const needsInspection = jobOrder.requires_inspection ?? true;

    const items = [
        { key: "assigned", label: "Assigned", icon: UserPlusIcon, at: jobOrder.created_at ?? "" },
        {
            key: "inspected",
            label: needsInspection ? "Inspected" : "Ready",
            icon: ClipboardDocumentCheckIcon,
            at: jobOrder.inspection?.inspected_at ?? (needsInspection ? null : jobOrder.created_at ?? ""),
        },
        { key: "working", label: "In progress", icon: PlayIcon, at: jobOrder.start_job },
        { key: "completed", label: "Completed", icon: CheckBadgeIcon, at: jobOrder.finish_job },
    ];

    const lastReached = items.reduce((last, item, index) => (item.at != null ? index : last), 0);
    const cancelled = jobOrder.status === "cancelled";

    return items.map((item, index) => {
        let state: StepState = "upcoming";
        if (index <= lastReached) state = "done";
        else if (index === lastReached + 1) state = cancelled ? "failed" : "current";
        return { ...item, state };
    });
};

export const jobOrderCaption = (jobOrder: JobOrder) => {
    const state = getInspectionState(jobOrder);

    if (jobOrder.status === "cancelled") return "Cancelled.";
    if (jobOrder.status === "completed") return "Work completed.";
    if (jobOrder.status === "in_progress") return "Work in progress.";
    if (state === "needed") return "Waiting for vehicle inspection.";
    if (state === "awaiting_decision") return "No problem found. Office needs to decide.";
    return "Ready to start.";
};
