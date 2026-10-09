import {
    BanknotesIcon,
    CheckBadgeIcon,
    ClockIcon,
    DocumentCheckIcon,
    DocumentTextIcon,
    KeyIcon,
    NoSymbolIcon,
    TruckIcon,
    XCircleIcon,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

import type { Reservation, ReservationStatus, ReservationStatusHistory } from "../../../api/ReservationManagement/reservationApi";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const RESERVATION_STATUS_THEME: Record<ReservationStatus, { label: string; color: string; icon: IconType }> = {
    pending_reservation: { label: "Pending Reservation", color: "yellow", icon: ClockIcon },
    pending_documents: { label: "Pending Documents", color: "purple", icon: DocumentTextIcon },
    pending_financing: { label: "Pending Financing", color: "cyan", icon: DocumentCheckIcon },
    pending_payment: { label: "Pending Payment", color: "orange", icon: BanknotesIcon },
    reserved: { label: "Reserved", color: "blue", icon: KeyIcon },
    completed: { label: "Completed", color: "green", icon: CheckBadgeIcon },
    rejected: { label: "Rejected", color: "red", icon: XCircleIcon },
    cancelled: { label: "Cancelled", color: "red", icon: NoSymbolIcon },
    expired: { label: "Expired", color: "gray", icon: ClockIcon },
};

export const reservationStatusTheme = (status?: string | null) =>
    RESERVATION_STATUS_THEME[status as ReservationStatus] ?? { label: status ?? "—", color: "gray", icon: ClockIcon };

export const STOPPED_STATUSES: ReservationStatus[] = ["rejected", "cancelled", "expired"];

const STEP_LABELS: Partial<Record<ReservationStatus, { label: string; icon: IconType }>> = {
    pending_reservation: { label: "Submitted · ID review", icon: DocumentTextIcon },
    pending_financing: { label: "Financing documents", icon: DocumentCheckIcon },
    pending_payment: { label: "Payment", icon: BanknotesIcon },
    reserved: { label: "Reserved", icon: KeyIcon },
    completed: { label: "Released", icon: TruckIcon },
};

export type ReservationStepState = "done" | "current" | "upcoming" | "stopped";

export interface ReservationStep {
    key: string;
    label: string;
    state: ReservationStepState;
    icon: IconType;
    at?: string | null;
    by?: string | null;
}

export const flowFor = (reservation: Pick<Reservation, "purchase_option">): ReservationStatus[] =>
    reservation.purchase_option === "financing"
        ? ["pending_reservation", "pending_financing", "pending_payment", "reserved", "completed"]
        : ["pending_reservation", "pending_payment", "reserved", "completed"];

const historyBy = (entry?: ReservationStatusHistory | null) =>
    entry ? (entry.user?.username ?? (entry.action === "created" ? "Customer" : "System")) : null;

const flowIndex = (flow: ReservationStatus[], status?: string | null) => {
    if (status === "pending_documents") return flow.indexOf("pending_financing") >= 0 ? flow.indexOf("pending_financing") : 0;
    return flow.indexOf(status as ReservationStatus);
};

export const getReservationSteps = (reservation: Reservation): ReservationStep[] => {
    const flow = flowFor(reservation);
    const history = reservation.status_histories ?? [];
    const status = reservation.reservation_status;
    const stopped = STOPPED_STATUSES.includes(status);
    const stopEntry = stopped ? [...history].reverse().find((entry) => entry.to_status === status) : null;
    const reachedIndex = stopped ? Math.max(flowIndex(flow, stopEntry?.from_status ?? "pending_reservation"), 0) : flowIndex(flow, status);
    const completed = status === "completed";

    const visible = stopped ? flow.slice(0, Math.max(reachedIndex, 1)) : flow;

    const steps: ReservationStep[] = visible.map((key, index) => {
        const entry = index === 0
            ? history.find((item) => item.action === "created") ?? null
            : [...history].reverse().find((item) => item.to_status === key) ?? null;
        const state: ReservationStepState = stopped || completed || index < reachedIndex
            ? "done"
            : index === reachedIndex
                ? "current"
                : "upcoming";

        return {
            key,
            label: STEP_LABELS[key]?.label ?? reservationStatusTheme(key).label,
            icon: STEP_LABELS[key]?.icon ?? reservationStatusTheme(key).icon,
            state,
            at: state === "upcoming" ? null : entry?.created_at ?? (index === 0 ? reservation.created_at ?? reservation.reserved_at : null),
            by: state === "upcoming" ? null : historyBy(entry),
        };
    });

    if (stopped) {
        const theme = reservationStatusTheme(status);
        steps.push({
            key: status,
            label: theme.label,
            icon: theme.icon,
            state: "stopped",
            at: stopEntry?.created_at ?? reservation.updated_at ?? null,
            by: historyBy(stopEntry),
        });
    }

    return steps;
};

export interface NextApproval {
    to: ReservationStatus;
    label: string;
    hint: string;
}

export const nextApproval = (reservation: Reservation): NextApproval | null => {
    const financing = reservation.purchase_option === "financing";

    switch (reservation.reservation_status) {
        case "pending_reservation":
        case "pending_documents":
            return financing
                ? { to: "pending_financing", label: "Approve · Request documents", hint: "The customer will be asked to submit the financing requirements." }
                : { to: "pending_payment", label: "Approve · Request payment", hint: "The customer will be asked to pay the reservation fee." };
        case "pending_financing":
            return { to: "pending_payment", label: "Approve financing", hint: "Financing documents are complete. The customer will be asked to continue with payment." };
        default:
            return null;
    }
};

export const stageMessage = (reservation: Reservation): { title: string; message: string; color: string } => {
    const idsApproved = reservation.valid_id_front_status === "approved" && reservation.valid_id_back_status === "approved";

    switch (reservation.reservation_status) {
        case "pending_reservation":
            return idsApproved
                ? { title: "Ready to approve", message: "Both IDs are approved. Approve the reservation to move it to the next step.", color: "green" }
                : { title: "Check the valid ID", message: "Approve the front and back of the ID (or ask for a resubmission) before approving.", color: "yellow" };
        case "pending_documents":
        case "pending_financing":
            return { title: "Waiting for financing documents", message: "Review the customer's financing requirements, then approve the financing.", color: "cyan" };
        case "pending_payment":
            return { title: "Waiting for payment", message: "This becomes Reserved automatically once the customer's payment is verified.", color: "orange" };
        case "reserved":
            return { title: "Vehicle on hold", message: "Waiting for full payment and vehicle release. It completes automatically on release.", color: "blue" };
        case "completed":
            return { title: "Completed", message: "The vehicle was released to the customer.", color: "green" };
        case "rejected":
            return { title: "Rejected", message: reservation.remarks || "This reservation was rejected.", color: "red" };
        case "cancelled":
            return { title: "Cancelled", message: reservation.remarks || "This reservation was cancelled.", color: "red" };
        case "expired":
            return { title: "Expired", message: "The 7-day hold ended before the process was finished.", color: "gray" };
        default:
            return { title: "Reservation", message: "", color: "gray" };
    }
};

export const canRejectReservation = (reservation: Reservation) =>
    !["completed", ...STOPPED_STATUSES].includes(reservation.reservation_status);
