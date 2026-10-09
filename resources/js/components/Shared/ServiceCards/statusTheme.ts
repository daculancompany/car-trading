import {
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    PlayCircleIcon,
    SparklesIcon,
    UserPlusIcon,
    WrenchIcon,
    WrenchScrewdriverIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    BeakerIcon,
    EllipsisHorizontalCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const STATUS_THEME: Record<string, { label: string; color: string; icon: IconType }> = {
    pending: { label: "Pending", color: "yellow", icon: ClockIcon },
    assigned: { label: "Assigned", color: "purple", icon: UserPlusIcon },
    in_progress: { label: "In progress", color: "blue", icon: PlayCircleIcon },
    completed: { label: "Completed", color: "green", icon: CheckBadgeIcon },
    cancelled: { label: "Cancelled", color: "red", icon: XCircleIcon },
};

export const statusTheme = (status?: string | null) =>
    STATUS_THEME[status ?? ""] ?? { label: status ?? "—", color: "gray", icon: ClockIcon };

export const WORK_TYPE_THEME: Record<string, { label: string; color: string; icon: IconType }> = {
    repair: { label: "Repair", color: "red", icon: WrenchScrewdriverIcon },
    maintenance: { label: "Maintenance", color: "blue", icon: WrenchIcon },
    inspection: { label: "Inspection", color: "purple", icon: MagnifyingGlassIcon },
    washing: { label: "Washing", color: "cyan", icon: BeakerIcon },
    detailing: { label: "Detailing", color: "pink", icon: SparklesIcon },
    other: { label: "Other", color: "gray", icon: EllipsisHorizontalCircleIcon },
};

export const workTypeTheme = (type?: string | null) =>
    WORK_TYPE_THEME[type ?? ""] ?? { label: type ?? "Service", color: "gray", icon: WrenchScrewdriverIcon };

export const URGENCY_COLOR: Record<string, string> = { low: "gray", normal: "blue", high: "orange", urgent: "red" };

export const INSPECTED_ICON = ClipboardDocumentCheckIcon;
