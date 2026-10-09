import type { JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";
import { getUser } from "../../../utils/auth";

export type JobOrderSourceFilter = "" | "customer" | "internal";

// Where a job order came from: a customer's service request, or the shop itself.
export const getJobOrderSource = (jobOrder: JobOrder) => {
    const request = jobOrder.requestService;
    const customer = request?.vehicle_release?.sale?.reservation?.customer;
    const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ");

    return {
        isCustomer: Boolean(request),
        label: request ? "Customer request" : "Shop job",
        requestNumber: request?.service_request_number ?? null,
        requestDetail: request?.request_detail ?? null,
        customerName,
        customerPhone: customer?.mobile_number ?? null,
        customer: customer ?? null,
    };
};

export const getJobOrderCosts = (jobOrder: JobOrder) => {
    const parts = (jobOrder.partsUsed ?? []).reduce(
        (sum, used) => sum + Number(used.vehicle_part?.unit_price ?? 0) * used.quantity,
        0,
    );
    const labor = Number(jobOrder.labor_cost) || 0;

    return { parts, labor, total: parts + labor };
};

export const PRIORITY_OPTIONS = [
    { value: "low", label: "Low", color: "gray" },
    { value: "normal", label: "Normal", color: "blue" },
    { value: "high", label: "High", color: "orange" },
    { value: "urgent", label: "Urgent", color: "red" },
] as const;

export const FUEL_OPTIONS = [
    { value: "empty", label: "Empty", percent: 0 },
    { value: "quarter", label: "1/4", percent: 25 },
    { value: "half", label: "1/2", percent: 50 },
    { value: "three_quarter", label: "3/4", percent: 75 },
    { value: "full", label: "Full", percent: 100 },
] as const;

export const INSPECTION_RESULTS = [
    { value: "confirmed", label: "Problem confirmed", color: "red", hint: "The reported problem was found." },
    { value: "partial", label: "Partially confirmed", color: "orange", hint: "Some of the problem was found, or something different." },
    { value: "not_found", label: "Not found", color: "gray", hint: "No problem found. The office decides whether to proceed." },
] as const;

export const NO_INSPECTION_WORK_TYPES = ["washing", "detailing"];

export const priorityInfo = (value?: string | null) =>
    PRIORITY_OPTIONS.find((option) => option.value === value) ?? PRIORITY_OPTIONS[1];

export const fuelInfo = (value?: string | null) => FUEL_OPTIONS.find((option) => option.value === value) ?? null;

export const resultInfo = (value?: string | null) => INSPECTION_RESULTS.find((option) => option.value === value) ?? null;

export type InspectionState = "not_required" | "needed" | "done" | "awaiting_decision" | "proceed" | "cancelled";

export const getInspectionState = (jobOrder: JobOrder): InspectionState => {
    const inspection = jobOrder.inspection;
    const required = jobOrder.requires_inspection ?? !NO_INSPECTION_WORK_TYPES.includes(jobOrder.work_type);

    if (!inspection) return required ? "needed" : "not_required";
    if (inspection.result !== "not_found") return "done";
    if (inspection.office_decision === "proceed") return "proceed";
    if (inspection.office_decision === "cancel") return "cancelled";
    return "awaiting_decision";
};

export const INSPECTION_STATE_BADGE: Record<InspectionState, { label: string; color: string } | null> = {
    not_required: null,
    needed: { label: "Needs inspection", color: "yellow" },
    done: { label: "Inspected", color: "green" },
    awaiting_decision: { label: "No problem found", color: "orange" },
    proceed: { label: "Proceed approved", color: "teal" },
    cancelled: { label: "Cancelled after inspection", color: "red" },
};

export const needsEstimate = (jobOrder: JobOrder) =>
    jobOrder.needs_estimate_approval ?? (Boolean(jobOrder.request_service_id) && !NO_INSPECTION_WORK_TYPES.includes(jobOrder.work_type));

export const canStartJob = (jobOrder: JobOrder) => {
    const state = getInspectionState(jobOrder);
    const inspected = state === "not_required" || state === "done" || state === "proceed";
    return inspected && (!needsEstimate(jobOrder) || jobOrder.estimate_status === "approved");
};

export const startBlockReason = (jobOrder: JobOrder): string | null => {
    if (canStartJob(jobOrder)) return null;
    const state = getInspectionState(jobOrder);
    if (state === "needed") return "Inspect the vehicle first";
    if (state === "awaiting_decision") return "Waiting for the office decision";
    if (jobOrder.estimate_status === "pending") return "Waiting for customer approval";
    if (jobOrder.estimate_status === "declined") return "Customer declined the estimate";
    return "Send the estimate to the customer";
};

export const ESTIMATE_BADGE: Record<string, { label: string; color: string }> = {
    none: { label: "Estimate not sent", color: "gray" },
    pending: { label: "Awaiting approval", color: "orange" },
    approved: { label: "Estimate approved", color: "green" },
    declined: { label: "Estimate declined", color: "red" },
};

export const PAYMENT_BADGE: Record<string, { label: string; color: string }> = {
    not_billed: { label: "Not billed", color: "gray" },
    unpaid: { label: "Unpaid", color: "red" },
    partial: { label: "Partially paid", color: "orange" },
    paid: { label: "Paid", color: "green" },
};

export const isCustomerUser = () => String(getUser()?.role?.name ?? "").toLowerCase() === "customer";

export const isOfficeUser = () => {
    const user = getUser();
    const role = String(user?.role?.name ?? "").toLowerCase();
    return role === "admin" || role === "secretary";
};

export const progressColor = (value: number) => (value >= 100 ? "green" : value >= 60 ? "teal" : value >= 30 ? "blue" : "orange");
