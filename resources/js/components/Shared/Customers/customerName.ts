export interface CustomerLike {
    id?: number | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
}

export const customerFullName = (customer?: CustomerLike | null): string =>
    [customer?.first_name, customer?.middle_name, customer?.last_name].filter(Boolean).join(" ");
