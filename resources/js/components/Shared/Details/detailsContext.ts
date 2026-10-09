import { createContext, useContext } from "react";

export type DetailsType = "customer" | "vehicle" | "part" | "jobOrder";

export interface DetailsContextValue {
    open: (type: DetailsType, id: number) => void;
}

export const DetailsContext = createContext<DetailsContextValue | null>(null);

export const useDetails = () => useContext(DetailsContext);
