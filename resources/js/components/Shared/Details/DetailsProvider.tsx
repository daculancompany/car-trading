import { Center, Modal, ModalContent, ModalOverlay, Spinner, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { getCustomer, type Customer } from "../../../api/UserManagement/customerApi";
import { getVehicle, type Vehicle } from "../../../api/VehicleManagement/vehicleApi";
import { getVehiclePart, type VehiclePart } from "../../../api/PartManagement/vehiclePartsApi";
import { getJobOrder, type JobOrder } from "../../../api/JobOrderManagement/jobOrderApi";

import CustomerTransactionModal from "../../Admin/Customers/CustomerTransactionModal";
import ViewVehicleModal from "../../Admin/Vehicles/ViewVehicleModal";
import JobOrderDetailsModal from "../../Admin/JobOrders/JobOrderDetailsModal";
import PartDetailsModal from "./PartDetailsModal";
import { DetailsContext, type DetailsType } from "./detailsContext";

type Opened =
    | { type: "customer"; data: Customer }
    | { type: "vehicle"; data: Vehicle }
    | { type: "part"; data: VehiclePart }
    | { type: "jobOrder"; data: JobOrder };

const loaders = {
    customer: getCustomer,
    vehicle: getVehicle,
    part: getVehiclePart,
    jobOrder: getJobOrder,
};

const labels: Record<DetailsType, string> = {
    customer: "customer",
    vehicle: "vehicle",
    part: "part",
    jobOrder: "job order",
};

export default function DetailsProvider({ children }: { children: ReactNode }) {
    const toast = useToast();
    const [stack, setStack] = useState<Opened[]>([]);
    const [loading, setLoading] = useState(false);

    const open = useCallback(
        async (type: DetailsType, id: number) => {
            try {
                setLoading(true);
                const data = await loaders[type](id);
                setStack((current) => [...current, { type, data } as Opened]);
            } catch (error) {
                console.error(`Failed to load ${type}:`, error);
                toast({ title: `Could not load ${labels[type]} details.`, status: "error", duration: 3000 });
            } finally {
                setLoading(false);
            }
        },
        [toast]
    );

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const view = searchParams.get("view") as DetailsType | null;
        const id = Number(searchParams.get("id"));
        if (!view || !(view in loaders) || !id) return;
        const next = new URLSearchParams(searchParams);
        next.delete("view");
        next.delete("id");
        setSearchParams(next, { replace: true });
        open(view, id);
    }, [searchParams, setSearchParams, open]);

    const value = useMemo(() => ({ open }), [open]);

    const top = stack[stack.length - 1] ?? null;
    const close = () => setStack((current) => current.slice(0, -1));

    const reloadJobOrder = (id: number) => {
        getJobOrder(id)
            .then((data) =>
                setStack((current) =>
                    current.map((item) =>
                        item.type === "jobOrder" && item.data.id === id ? { type: "jobOrder", data } : item
                    )
                )
            )
            .catch(() => undefined);
    };

    return (
        <DetailsContext.Provider value={value}>
            {children}

            <Modal isOpen={loading} onClose={() => undefined} isCentered>
                <ModalOverlay />
                <ModalContent bg="transparent" shadow="none">
                    <Center>
                        <Spinner color="white" size="lg" />
                    </Center>
                </ModalContent>
            </Modal>

            <CustomerTransactionModal
                isOpen={top?.type === "customer"}
                onClose={close}
                customer={top?.type === "customer" ? top.data : null}
            />

            <ViewVehicleModal
                isOpen={top?.type === "vehicle"}
                onClose={close}
                vehicle={top?.type === "vehicle" ? top.data : null}
            />

            <PartDetailsModal
                isOpen={top?.type === "part"}
                onClose={close}
                part={top?.type === "part" ? top.data : null}
            />

            <JobOrderDetailsModal
                isOpen={top?.type === "jobOrder"}
                onClose={close}
                jobOrder={top?.type === "jobOrder" ? top.data : null}
                onChanged={() => top?.type === "jobOrder" && reloadJobOrder(top.data.id)}
            />
        </DetailsContext.Provider>
    );
}
