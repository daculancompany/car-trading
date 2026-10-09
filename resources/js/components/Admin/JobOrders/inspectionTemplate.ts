import template from "./inspectionTemplate.json";
import type {
    DamageMark,
    DamageView,
    InspectionBrakes,
    InspectionCheckItem,
    InspectionCheckStatus,
    InspectionRating,
    InspectionTires,
    JobOrderInspection,
    WheelKey,
} from "../../../api/JobOrderManagement/jobOrderApi";

export interface InspectionSection {
    key: string;
    title: string;
    color: string;
    items: string[];
}

export const INSPECTION_SECTIONS: InspectionSection[] = template.sections;
export const PRE_CHECKS = template.pre_checks;
export const WHEELS = template.wheels as { key: WheelKey; label: string }[];
export const DAMAGE_VIEWS = template.damage_views as { key: DamageView; label: string }[];
export const DAMAGE_TYPES = template.damage_types;
export const RECOMMENDED_SERVICES = template.recommended_services;
export const THRESHOLDS = template.thresholds;

export const RATING_META: Record<InspectionRating, { label: string; short: string; color: string; hex: string }> = {
    good: { label: "Checked and OK", short: "OK", color: "green", hex: "#38A169" },
    attention: { label: "May require further attention", short: "Attention", color: "yellow", hex: "#D69E2E" },
    urgent: { label: "Requires immediate attention", short: "Urgent", color: "red", hex: "#E53E3E" },
    na: { label: "Not applicable", short: "N/A", color: "gray", hex: "#A0AEC0" },
};

export const normalizeRating = (status?: InspectionCheckStatus | null): InspectionRating | null => {
    if (!status) return null;
    if (status === "ok") return "good";
    if (status === "issue") return "urgent";
    return status;
};

export const ratingFromMm = (mm?: number | null): InspectionRating | null => {
    if (mm == null || Number.isNaN(mm)) return null;
    if (mm >= THRESHOLDS.good) return "good";
    if (mm >= THRESHOLDS.attention) return "attention";
    return "urgent";
};

export const damageTypeLabel = (key: string) => DAMAGE_TYPES.find((type) => type.key === key)?.label ?? key;

export const damageLabel = (mark: Pick<DamageMark, "no">) => `Damage #${mark.no}`;

export const serviceLabel = (key: string) => RECOMMENDED_SERVICES.find((service) => service.key === key)?.label ?? key;

export interface FormItem {
    section: string;
    item: string;
    status: InspectionRating | null;
    note: string;
}

export const buildFormItems = (saved?: InspectionCheckItem[] | null): FormItem[] => {
    const lookup = new Map((saved ?? []).map((entry) => [entry.item, entry]));
    const known = new Set(INSPECTION_SECTIONS.flatMap((section) => section.items));
    const items: FormItem[] = INSPECTION_SECTIONS.flatMap((section) =>
        section.items.map((item) => {
            const entry = lookup.get(item);
            return { section: section.title, item, status: normalizeRating(entry?.status), note: entry?.note ?? "" };
        }),
    );
    const extras = (saved ?? [])
        .filter((entry) => !known.has(entry.item))
        .map((entry) => ({ section: "General", item: entry.item, status: normalizeRating(entry.status), note: entry.note ?? "" }));
    return [...items, ...extras];
};

export interface InspectionFormState {
    items: FormItem[];
    preChecks: Record<string, boolean>;
    tires: Required<Pick<InspectionTires, "size" | "spare_ok">> & { wheels: Record<WheelKey, { psi: number | null; tread_mm: number | null; status: InspectionRating | null }> };
    brakes: Record<WheelKey, { pad_mm: number | null; status: InspectionRating | null }>;
    marks: DamageMark[];
    services: string[];
    fuelLevel: string;
    nextServiceDate: string;
    serviceRequired: string;
    estimatedCost: number | null;
    notes: string;
}

export const buildFormState = (inspection?: JobOrderInspection | null, fuelFallback?: string | null): InspectionFormState => {
    const tires = inspection?.tires ?? {};
    const brakes: InspectionBrakes = inspection?.brakes ?? {};
    const wheels = Object.fromEntries(
        WHEELS.map((wheel) => {
            const saved = tires.wheels?.[wheel.key];
            return [wheel.key, { psi: saved?.psi ?? null, tread_mm: saved?.tread_mm ?? null, status: normalizeRating(saved?.status) }];
        }),
    ) as InspectionFormState["tires"]["wheels"];
    const brakeState = Object.fromEntries(
        WHEELS.map((wheel) => {
            const saved = brakes[wheel.key];
            return [wheel.key, { pad_mm: saved?.pad_mm ?? null, status: normalizeRating(saved?.status) }];
        }),
    ) as InspectionFormState["brakes"];

    return {
        items: buildFormItems(inspection?.checklist),
        preChecks: Object.fromEntries(PRE_CHECKS.map((check) => [check.key, Boolean(inspection?.pre_checks?.[check.key])])),
        tires: { size: tires.size ?? "", spare_ok: Boolean(tires.spare_ok), wheels },
        brakes: brakeState,
        marks: inspection?.damage_marks ?? [],
        services: inspection?.recommended_services ?? [],
        fuelLevel: inspection?.fuel_level ?? fuelFallback ?? "",
        nextServiceDate: inspection?.next_service_date ?? "",
        serviceRequired: inspection?.service_required ?? "",
        estimatedCost: inspection?.estimated_cost != null ? Number(inspection.estimated_cost) : null,
        notes: inspection?.notes ?? "",
    };
};

export const countRatings = (form: InspectionFormState) => {
    const ratings = [
        ...form.items.map((entry) => entry.status),
        ...WHEELS.map((wheel) => form.tires.wheels[wheel.key].status),
        ...WHEELS.map((wheel) => form.brakes[wheel.key].status),
    ];
    return {
        good: ratings.filter((rating) => rating === "good").length,
        attention: ratings.filter((rating) => rating === "attention").length,
        urgent: ratings.filter((rating) => rating === "urgent").length,
        na: ratings.filter((rating) => rating === "na").length,
        unchecked: form.items.filter((entry) => !entry.status).length,
        damages: form.marks.length,
    };
};
