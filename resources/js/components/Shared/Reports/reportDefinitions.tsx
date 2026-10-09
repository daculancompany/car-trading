import { Text } from "@chakra-ui/react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import {
    ArrowsRightLeftIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    CubeIcon,
    CurrencyDollarIcon,
    KeyIcon,
    ReceiptPercentIcon,
    TruckIcon,
    UserGroupIcon,
    WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import type { ReportPath, ReportRow } from "../../../api/Reports/reportApi";
import StatusBadge from "./StatusBadge";
import DetailsLink from "../Details/DetailsLink";
import type { DetailsType } from "../Details/detailsContext";
import { labelize } from "./reportFormat";

const pick = (row: unknown, path: string): unknown =>
    path.split(".").reduce<unknown>(
        (value, key) =>
            value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined,
        row
    );

const str = (row: unknown, path: string): string => {
    const value = pick(row, path);
    return value === undefined || value === null ? "" : String(value);
};

const num = (row: unknown, path: string): number => Number(pick(row, path) ?? 0) || 0;

const peso = (value: number): string =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value || 0);

const count = (value: number): string => (value || 0).toLocaleString("en-PH");

const date = (row: unknown, path: string, withTime = false): string => {
    const value = str(row, path);
    if (!value) return "—";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime && { hour: "numeric", minute: "2-digit" }),
    });
};

const fullName = (person: unknown): string =>
    [str(person, "first_name"), str(person, "last_name")].filter(Boolean).join(" ") || "—";

const vehicleName = (vehicle: unknown): string =>
    [str(vehicle, "brand.brand"), str(vehicle, "model.model"), str(vehicle, "variant.variant")]
        .filter(Boolean)
        .join(" ") || "—";

const idOf = (row: unknown, path: string): number | undefined => {
    const value = Number(pick(row, path));
    return value > 0 ? value : undefined;
};

const link = (type: DetailsType, id: number | undefined, text: ReactNode) => (
    <DetailsLink type={type} id={id}>
        {text}
    </DetailsLink>
);

const customerCell = (row: unknown, path: string) => link("customer", idOf(row, `${path}.id`), fullName(pick(row, path)));

const vehicleCell = (row: unknown, path: string) =>
    link("vehicle", idOf(row, path ? `${path}.id` : "id"), vehicleName(path ? pick(row, path) : row));

const options = (...values: string[]) => values.map((value) => ({ value, label: labelize(value) }));

export interface ReportColumn {
    header: string;
    align?: "left" | "center" | "right";
    render: (row: ReportRow) => ReactNode;
}

export interface ReportCard {
    label: string;
    value: string;
    color: string;
}

export interface ReportDefinition {
    key: ReportPath;
    label: string;
    description: string;
    group: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    dateFiltered: boolean;
    cards: (summary: Record<string, number>) => ReportCard[];
    columns: ReportColumn[];
    statusLabel?: string;
    statusOptions?: { value: string; label: string }[];
    statusOf?: (row: ReportRow) => string;
    searchText: (row: ReportRow) => string;
}

export const REPORT_GROUPS = ["Sales & Finance", "Reservations & Vehicles", "Service & Parts"];

const movementLabels: Record<string, string> = {
    receiving: "In · Receiving",
    stock_in: "In · Returned",
    stock_out: "Out · Used",
    damage: "Out · Damage",
};

const partStatus = (row: ReportRow): string => {
    const quantity = num(row, "quantity");
    if (quantity <= 0) return "out";
    if (quantity <= 5) return "low";
    return "in";
};

const partStatusLabels: Record<string, string> = { in: "In Stock", low: "Low Stock", out: "Out of Stock" };

export const REPORTS: ReportDefinition[] = [
    {
        key: "sales",
        label: "Sales",
        description: "Vehicle sales, discounts and net sales.",
        group: "Sales & Finance",
        icon: CurrencyDollarIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Transactions", value: count(s.total_transactions), color: "blue" },
            { label: "Completed", value: count(s.completed_sales), color: "green" },
            { label: "Total Sales", value: peso(s.total_sales), color: "teal" },
            { label: "Discounts", value: peso(s.total_discount), color: "orange" },
            { label: "Net Sales", value: peso(s.net_sales), color: "green" },
        ],
        columns: [
            { header: "Invoice No.", render: (r) => <Text fontWeight="600">{str(r, "invoice_number")}</Text> },
            { header: "Sale Date", render: (r) => date(r, "sale_date") },
            { header: "Customer", render: (r) => customerCell(r, "reservation.customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "reservation.vehicle") },
            { header: "Price", align: "right", render: (r) => peso(num(r, "selling_price")) },
            { header: "Discount", align: "right", render: (r) => peso(num(r, "discount_amount")) },
            { header: "Net", align: "right", render: (r) => <b>{peso(num(r, "selling_price") - num(r, "discount_amount"))}</b> },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "status")} /> },
        ],
        statusOptions: options("pending", "completed", "cancelled"),
        statusOf: (r) => str(r, "status"),
        searchText: (r) =>
            [str(r, "invoice_number"), fullName(pick(r, "reservation.customer")), vehicleName(pick(r, "reservation.vehicle"))].join(" "),
    },
    {
        key: "payments",
        label: "Payments",
        description: "Payment transactions and verified amounts.",
        group: "Sales & Finance",
        icon: CreditCardIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Transactions", value: count(s.total_transactions), color: "blue" },
            { label: "Verified", value: count(s.verified_payments), color: "green" },
            { label: "Pending", value: count(s.pending_payments), color: "yellow" },
            { label: "Rejected", value: count(s.rejected_payments), color: "red" },
            { label: "Verified Amount", value: peso(s.total_verified_amount), color: "green" },
        ],
        columns: [
            { header: "Payment Date", render: (r) => date(r, "payment_date") },
            { header: "Reference No.", render: (r) => str(r, "reference_number") || "—" },
            { header: "Customer", render: (r) => customerCell(r, "reservation.customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "reservation.vehicle") },
            { header: "Type", render: (r) => labelize(str(r, "payment_type")) },
            { header: "Method", render: (r) => labelize(str(r, "payment_method")) },
            { header: "Account", render: (r) => str(r, "payment_account.account_provider") || "—" },
            { header: "Amount", align: "right", render: (r) => <b>{peso(num(r, "amount"))}</b> },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "payment_status")} /> },
        ],
        statusOptions: options("pending", "verified", "rejected"),
        statusOf: (r) => str(r, "payment_status"),
        searchText: (r) =>
            [str(r, "reference_number"), fullName(pick(r, "reservation.customer")), vehicleName(pick(r, "reservation.vehicle")), str(r, "payment_method")].join(" "),
    },
    {
        key: "financing",
        label: "Financing",
        description: "Financing applications and approved amounts.",
        group: "Sales & Finance",
        icon: BanknotesIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Applications", value: count(s.total_applications), color: "blue" },
            { label: "Pending", value: count(s.pending), color: "yellow" },
            { label: "Approved", value: count(s.approved), color: "green" },
            { label: "Rejected", value: count(s.rejected), color: "red" },
            { label: "Approved Amount", value: peso(s.approved_amount), color: "green" },
        ],
        columns: [
            { header: "Date", render: (r) => date(r, "created_at") },
            { header: "Reference No.", render: (r) => str(r, "financing_reference_no") || "—" },
            { header: "Customer", render: (r) => customerCell(r, "reservation.customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "reservation.vehicle") },
            { header: "Company", render: (r) => str(r, "company_name") || "—" },
            { header: "Financed", align: "right", render: (r) => peso(num(r, "financed_amount")) },
            { header: "Monthly", align: "right", render: (r) => peso(num(r, "monthly_payment")) },
            { header: "Term", align: "center", render: (r) => (num(r, "loan_term_months") ? `${num(r, "loan_term_months")} mos` : "—") },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "financing_status")} /> },
        ],
        statusOptions: options("pending", "completed", "approved", "rejected", "cancelled"),
        statusOf: (r) => str(r, "financing_status"),
        searchText: (r) =>
            [str(r, "financing_reference_no"), str(r, "company_name"), fullName(pick(r, "reservation.customer")), vehicleName(pick(r, "reservation.vehicle"))].join(" "),
    },
    {
        key: "expenses",
        label: "Vehicle Expenses",
        description: "Expenses recorded on vehicles.",
        group: "Sales & Finance",
        icon: ReceiptPercentIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Expense Records", value: count(s.total_expenses), color: "blue" },
            { label: "Total Expenses", value: peso(s.total_amount), color: "red" },
        ],
        columns: [
            { header: "Date", render: (r) => date(r, "created_at") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "vehicle") },
            { header: "Stock No.", render: (r) => str(r, "vehicle.stock_no") || "—" },
            { header: "Expense Type", render: (r) => str(r, "expense_type.expense_name") || "—" },
            { header: "Amount", align: "right", render: (r) => <b>{peso(num(r, "amount"))}</b> },
            { header: "Remarks", render: (r) => str(r, "remarks") || "—" },
        ],
        statusLabel: "Expense Type",
        statusOf: (r) => str(r, "expense_type.expense_name"),
        searchText: (r) =>
            [vehicleName(pick(r, "vehicle")), str(r, "vehicle.stock_no"), str(r, "expense_type.expense_name"), str(r, "remarks")].join(" "),
    },

    {
        key: "reservations",
        label: "Reservations",
        description: "Reservation activity and statuses.",
        group: "Reservations & Vehicles",
        icon: CalendarDaysIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Reservations", value: count(s.total_reservations), color: "blue" },
            { label: "Pending", value: count(s.pending), color: "yellow" },
            { label: "Reserved", value: count(s.reserved), color: "blue" },
            { label: "Completed", value: count(s.completed), color: "green" },
            { label: "Cancelled / Expired", value: count((s.cancelled || 0) + (s.expired || 0)), color: "red" },
        ],
        columns: [
            { header: "Reserved At", render: (r) => date(r, "reserved_at") },
            { header: "Customer", render: (r) => customerCell(r, "customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "vehicle") },
            { header: "Source", render: (r) => labelize(str(r, "reservation_source")) },
            { header: "Purchase", render: (r) => labelize(str(r, "purchase_option")) },
            { header: "Expires", render: (r) => date(r, "expires_at") },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "reservation_status")} /> },
        ],
        statusOptions: options(
            "pending_reservation",
            "pending_documents",
            "pending_financing",
            "pending_payment",
            "reserved",
            "completed",
            "cancelled",
            "expired"
        ),
        statusOf: (r) => str(r, "reservation_status"),
        searchText: (r) => [fullName(pick(r, "customer")), vehicleName(pick(r, "vehicle")), str(r, "vehicle.stock_no")].join(" "),
    },
    {
        key: "vehicles",
        label: "Vehicle Inventory",
        description: "Current vehicles and their status.",
        group: "Reservations & Vehicles",
        icon: TruckIcon,
        dateFiltered: false,
        cards: (s) => [
            { label: "Vehicles", value: count(s.total_vehicles), color: "blue" },
            { label: "Available", value: count(s.available), color: "green" },
            { label: "Reserved", value: count(s.reserved), color: "blue" },
            { label: "Sold", value: count(s.sold), color: "purple" },
            { label: "Maintenance / Unavailable", value: count((s.maintenance || 0) + (s.unavailable || 0)), color: "orange" },
        ],
        columns: [
            { header: "Stock No.", render: (r) => link("vehicle", idOf(r, "id"), <Text as="span" fontWeight="600">{str(r, "stock_no") || "—"}</Text>) },
            { header: "Vehicle", render: (r) => vehicleCell(r, "") },
            { header: "Year", align: "center", render: (r) => str(r, "year_model") || "—" },
            { header: "Color", render: (r) => str(r, "color") || "—" },
            { header: "Plate No.", render: (r) => str(r, "specs.plate_number") || "—" },
            { header: "Selling Price", align: "right", render: (r) => peso(num(r, "selling_price")) },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "status")} /> },
        ],
        statusOptions: options("available", "reserved", "sold", "maintenance", "unavailable"),
        statusOf: (r) => str(r, "status"),
        searchText: (r) => [str(r, "stock_no"), vehicleName(r), str(r, "color"), str(r, "specs.plate_number")].join(" "),
    },
    {
        key: "releases",
        label: "Vehicle Releases",
        description: "Vehicles released to customers.",
        group: "Reservations & Vehicles",
        icon: KeyIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Releases", value: count(s.total_releases), color: "blue" },
            { label: "Pending", value: count(s.pending), color: "yellow" },
            { label: "Released", value: count(s.released), color: "green" },
            { label: "Cancelled", value: count(s.cancelled), color: "red" },
        ],
        columns: [
            { header: "Release No.", render: (r) => <Text fontWeight="600">{str(r, "release_number")}</Text> },
            { header: "Release Date", render: (r) => date(r, "release_date") },
            { header: "Invoice No.", render: (r) => str(r, "sale.invoice_number") || "—" },
            { header: "Customer", render: (r) => customerCell(r, "sale.reservation.customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "sale.reservation.vehicle") },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "status")} /> },
        ],
        statusOptions: options("pending", "released", "cancelled"),
        statusOf: (r) => str(r, "status"),
        searchText: (r) =>
            [str(r, "release_number"), str(r, "sale.invoice_number"), fullName(pick(r, "sale.reservation.customer")), vehicleName(pick(r, "sale.reservation.vehicle"))].join(" "),
    },

    {
        key: "services",
        label: "Service Requests",
        description: "Customer service requests and their status.",
        group: "Service & Parts",
        icon: WrenchScrewdriverIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Requests", value: count(s.total_requests), color: "blue" },
            { label: "Pending", value: count(s.pending), color: "yellow" },
            { label: "In Progress", value: count((s.assigned || 0) + (s.in_progress || 0)), color: "blue" },
            { label: "Completed", value: count(s.completed), color: "green" },
            { label: "Cancelled", value: count(s.cancelled), color: "red" },
        ],
        columns: [
            { header: "Request No.", render: (r) => <Text fontWeight="600">{str(r, "service_request_number")}</Text> },
            { header: "Date", render: (r) => date(r, "created_at") },
            { header: "Customer", render: (r) => customerCell(r, "vehicle_release.sale.reservation.customer") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "vehicle_release.sale.reservation.vehicle") },
            {
                header: "Request",
                render: (r) => (
                    <Text noOfLines={2} maxW="260px" whiteSpace="normal">
                        {str(r, "request_detail") || "—"}
                    </Text>
                ),
            },
            { header: "Job Order", render: (r) => link("jobOrder", idOf(r, "job_order.id"), str(r, "job_order.job_order_no") || "—") },
            { header: "Assigned To", render: (r) => (pick(r, "job_order.assigned_staff") ? fullName(pick(r, "job_order.assigned_staff")) : "—") },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "status")} /> },
        ],
        statusOptions: options("pending", "assigned", "in_progress", "completed", "cancelled"),
        statusOf: (r) => str(r, "status"),
        searchText: (r) =>
            [str(r, "service_request_number"), str(r, "request_detail"), str(r, "job_order.job_order_no"), fullName(pick(r, "vehicle_release.sale.reservation.customer"))].join(" "),
    },
    {
        key: "job-orders",
        label: "Job Orders",
        description: "Shop work with labor and parts cost.",
        group: "Service & Parts",
        icon: ClipboardDocumentListIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Job Orders", value: count(s.total_job_orders), color: "blue" },
            { label: "Completed", value: count(s.completed), color: "green" },
            { label: "Labor", value: peso(s.total_labor), color: "teal" },
            { label: "Parts", value: peso(s.total_parts), color: "orange" },
            { label: "Grand Total", value: peso(s.grand_total), color: "green" },
        ],
        columns: [
            { header: "JO No.", render: (r) => link("jobOrder", idOf(r, "id"), <Text as="span" fontWeight="600">{str(r, "job_order_no")}</Text>) },
            { header: "Date", render: (r) => date(r, "created_at") },
            { header: "Vehicle", render: (r) => vehicleCell(r, "vehicle") },
            { header: "Work Type", render: (r) => labelize(str(r, "work_type")) },
            { header: "Assigned To", render: (r) => fullName(pick(r, "assigned_staff")) },
            { header: "Labor", align: "right", render: (r) => peso(num(r, "labor_cost")) },
            { header: "Parts", align: "right", render: (r) => peso(num(r, "parts_cost")) },
            { header: "Total", align: "right", render: (r) => <b>{peso(num(r, "total_cost"))}</b> },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "status")} /> },
        ],
        statusOptions: options("pending", "assigned", "in_progress", "completed", "cancelled"),
        statusOf: (r) => str(r, "status"),
        searchText: (r) =>
            [str(r, "job_order_no"), vehicleName(pick(r, "vehicle")), fullName(pick(r, "assigned_staff")), str(r, "work_type"), str(r, "description")].join(" "),
    },
    {
        key: "mechanics",
        label: "Mechanic Performance",
        description: "Jobs, speed, ratings and revenue per mechanic.",
        group: "Service & Parts",
        icon: UserGroupIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Staff", value: count(s.staff), color: "blue" },
            { label: "Jobs", value: count(s.total_jobs), color: "teal" },
            { label: "Completed", value: count(s.completed), color: "green" },
            { label: "Avg Rating", value: s.avg_rating ? `${s.avg_rating} ★` : "—", color: "yellow" },
            { label: "Revenue", value: peso(s.total_revenue), color: "green" },
        ],
        columns: [
            { header: "Staff", render: (r) => <Text as="span" fontWeight="600">{str(r, "name")}</Text> },
            { header: "Role", render: (r) => str(r, "role") },
            { header: "Jobs", align: "center", render: (r) => count(num(r, "total_jobs")) },
            { header: "Completed", align: "center", render: (r) => count(num(r, "completed")) },
            { header: "In Progress", align: "center", render: (r) => count(num(r, "in_progress")) },
            { header: "Avg Hours", align: "center", render: (r) => (pick(r, "avg_hours") == null ? "—" : `${str(r, "avg_hours")} h`) },
            { header: "On Time", align: "center", render: (r) => (pick(r, "on_time_rate") == null ? "—" : `${str(r, "on_time_rate")}%`) },
            { header: "Rating", align: "center", render: (r) => (pick(r, "avg_rating") == null ? "—" : `${str(r, "avg_rating")} ★ (${str(r, "ratings")})`) },
            { header: "Labor", align: "right", render: (r) => peso(num(r, "labor_revenue")) },
            { header: "Revenue", align: "right", render: (r) => <b>{peso(num(r, "total_revenue"))}</b> },
        ],
        searchText: (r) => [str(r, "name"), str(r, "role")].join(" "),
    },
    {
        key: "service-billing",
        label: "Service Billing",
        description: "Service invoices, collections and unpaid balances.",
        group: "Service & Parts",
        icon: BanknotesIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Invoices", value: count(s.invoices), color: "blue" },
            { label: "Billed", value: peso(s.billed), color: "teal" },
            { label: "Collected", value: peso(s.collected), color: "green" },
            { label: "Outstanding", value: peso(s.outstanding), color: "red" },
            { label: "Unpaid / Partial", value: count(s.unpaid), color: "orange" },
        ],
        columns: [
            { header: "Invoice", render: (r) => <Text as="span" fontWeight="600">{str(r, "invoice_no") || "—"}</Text> },
            { header: "Job Order", render: (r) => link("jobOrder", idOf(r, "id"), str(r, "job_order_no")) },
            { header: "Completed", render: (r) => date(r, "finish_job") },
            { header: "Customer", render: (r) => str(r, "customer_name") },
            { header: "Vehicle", render: (r) => str(r, "vehicle") },
            { header: "Total", align: "right", render: (r) => peso(num(r, "total_cost")) },
            { header: "Paid", align: "right", render: (r) => peso(num(r, "amount_paid")) },
            { header: "Balance", align: "right", render: (r) => <b>{peso(num(r, "balance"))}</b> },
            { header: "Status", align: "center", render: (r) => <StatusBadge status={str(r, "payment_status")} /> },
        ],
        statusOptions: options("paid", "partial", "unpaid"),
        statusOf: (r) => str(r, "payment_status"),
        searchText: (r) => [str(r, "invoice_no"), str(r, "job_order_no"), str(r, "customer_name"), str(r, "vehicle")].join(" "),
    },
    {
        key: "parts",
        label: "Parts Inventory",
        description: "Current parts stock and value.",
        group: "Service & Parts",
        icon: CubeIcon,
        dateFiltered: false,
        cards: (s) => [
            { label: "Parts", value: count(s.total_parts), color: "blue" },
            { label: "Total Quantity", value: count(s.total_quantity), color: "teal" },
            { label: "Stock Value", value: peso(s.stock_value), color: "green" },
            { label: "Low Stock", value: count(s.low_stock), color: "orange" },
            { label: "Out of Stock", value: count(s.out_of_stock), color: "red" },
        ],
        columns: [
            { header: "Part", render: (r) => link("part", idOf(r, "id"), <Text as="span" fontWeight="600">{str(r, "part_name")}</Text>) },
            { header: "Category", render: (r) => str(r, "category") },
            { header: "Qty on Hand", align: "center", render: (r) => <b>{num(r, "quantity")}</b> },
            { header: "Unit Price", align: "right", render: (r) => peso(num(r, "unit_price")) },
            { header: "Stock Value", align: "right", render: (r) => peso(num(r, "stock_value")) },
            {
                header: "Status",
                align: "center",
                render: (r) => <StatusBadge status={partStatus(r)} label={partStatusLabels[partStatus(r)]} />,
            },
        ],
        statusOptions: [
            { value: "in", label: "In Stock" },
            { value: "low", label: "Low Stock" },
            { value: "out", label: "Out of Stock" },
        ],
        statusOf: partStatus,
        searchText: (r) => [str(r, "part_name"), str(r, "category")].join(" "),
    },
    {
        key: "stock-movements",
        label: "Stock Movements",
        description: "Parts in and out: receiving, used, returned, damage.",
        group: "Service & Parts",
        icon: ArrowsRightLeftIcon,
        dateFiltered: true,
        cards: (s) => [
            { label: "Movements", value: count(s.total_movements), color: "blue" },
            { label: "Stock In", value: `${count(s.in_quantity)} · ${peso(s.in_amount)}`, color: "green" },
            { label: "Stock Out", value: `${count(s.out_quantity)} · ${peso(s.out_amount)}`, color: "orange" },
            { label: "Damage", value: `${count(s.damage_quantity)} · ${peso(s.damage_amount)}`, color: "red" },
        ],
        columns: [
            { header: "Date", render: (r) => date(r, "moved_at", true) },
            { header: "Part", render: (r) => link("part", idOf(r, "vehicle_part_id"), <Text as="span" fontWeight="600">{str(r, "vehicle_part.part_name") || "—"}</Text>) },
            {
                header: "Type",
                render: (r) => <StatusBadge status={str(r, "type")} label={movementLabels[str(r, "type")]} />,
            },
            { header: "Unit Cost", align: "right", render: (r) => peso(num(r, "unit_cost")) },
            {
                header: "Qty",
                align: "right",
                render: (r) => {
                    const incoming = ["receiving", "stock_in"].includes(str(r, "type"));
                    return (
                        <Text fontWeight="600" color={incoming ? "green.600" : "red.600"}>
                            {incoming ? "+" : "−"}
                            {num(r, "quantity")}
                        </Text>
                    );
                },
            },
            { header: "Amount", align: "right", render: (r) => peso(num(r, "amount")) },
            { header: "Prev → New", align: "center", render: (r) => `${num(r, "previous_quantity")} → ${num(r, "new_quantity")}` },
            { header: "Ref No.", render: (r) => (idOf(r, "job_order_id") ? link("jobOrder", idOf(r, "job_order_id"), str(r, "reference_no")) : str(r, "reference_no") || "—") },
            { header: "By", render: (r) => str(r, "creator.username") || "—" },
            {
                header: "Remarks",
                render: (r) => (
                    <Text noOfLines={2} maxW="220px" whiteSpace="normal">
                        {str(r, "remarks") || "—"}
                    </Text>
                ),
            },
        ],
        statusLabel: "Type",
        statusOptions: Object.entries(movementLabels).map(([value, label]) => ({ value, label })),
        statusOf: (r) => str(r, "type"),
        searchText: (r) => [str(r, "vehicle_part.part_name"), str(r, "reference_no"), str(r, "remarks"), str(r, "creator.username")].join(" "),
    },
];
