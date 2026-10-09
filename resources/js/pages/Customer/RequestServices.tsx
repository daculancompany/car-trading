import {
    useEffect,
    useState,
} from "react";

import {
    Grid,
    GridItem,
    useDisclosure,
} from "@chakra-ui/react";

import PageHeader
    from "../../components/Customers/Dashboard/DashboardPageHeader";

import RequestTable
    from "../../components/Customers/JobOrders/RequestTable";

import RequestToolbar
    from "../../components/Customers/JobOrders/RequestToolbar";

import AddRequestServiceModal
    from "../../components/Customers/JobOrders/AddRequestServiceModal";

import {
    getRequestServices,
    type RequestService,
    type VehicleRelease,
} from "../../api/JobOrderManagement/requestServiceApi";

import {
    getVehicleReleases,
} from "../../api/VehicleManagement/releaseApi";

import {
    getSales,
} from "../../api/SaleManagement/saleApi";

export default function CustomerRequestServicePage() {

    const [, setVehicleLoading] = useState(false);

    // MODAL

    const {
        isOpen,
        onOpen,
        onClose,
    } = useDisclosure();

    // REQUEST SERVICES

    const [
        requestServices,
        setRequestServices,
    ] = useState<RequestService[]>([]);

    // CUSTOMER VEHICLE RELEASES

    const [
        vehicleReleases,
        setVehicleReleases,
    ] = useState<VehicleRelease[]>([]);

    // LOADING

    const [
        loading,
        setLoading,
    ] = useState(false);

    // SEARCH

    const [
        search,
        setSearch,
    ] = useState("");

    // STATUS

    const [
        status,
        setStatus,
    ] = useState("");

    // LOAD REQUEST SERVICES

    const loadRequestServices = async () => {

        try {

            setLoading(true);

            const data =
                await getRequestServices();

            setRequestServices(data);

        } catch (error) {

            console.error(
                "Failed to load request services:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    // LOAD VEHICLE RELEASES

    const loadVehicleReleases = async () => {

        try {

            setVehicleLoading(true);

            const [releaseData, sales] = await Promise.all([
                getVehicleReleases(),
                getSales(),
            ]);

            const completedSaleIds = new Set(
                sales
                    .filter(
                        (sale) =>
                            String(sale.status ?? "").toLowerCase() ===
                            "completed",
                    )
                    .map((sale) => sale.id),
            );


            // Customer Request Service
            // Only released vehicles should be selectable.

            const releasedVehicles =
                releaseData.filter(
                    (release) => {
                        const isReleased =
                            String(release.status ?? "").toLowerCase() ===
                            "released";

                        if (!isReleased) return false;

                        // Customer-scoped release endpoints may omit the sale
                        // relationship. In that case, the release list itself
                        // is the ownership boundary.
                        if (!release.sale) return true;

                        return (
                            String(release.sale.status ?? "").toLowerCase() ===
                            "completed" &&
                            completedSaleIds.has(release.sale_id)
                        );
                    },
                );

            // One entry per vehicle, keeping its most recent release.
            const seenVehicles = new Set<number>();
            const uniqueVehicles = [...releasedVehicles]
                .sort((a, b) => b.id - a.id)
                .filter((release) => {
                    const vehicleId = release.sale?.reservation?.vehicle?.id ?? -release.id;
                    if (seenVehicles.has(vehicleId)) return false;
                    seenVehicles.add(vehicleId);
                    return true;
                });

            setVehicleReleases(
                uniqueVehicles
            );

        } catch (error) {

            console.error(
                "Failed to load vehicle releases:",
                error
            );

        } finally {

            setVehicleLoading(false);
        }
    };

    // INITIAL LOAD

    useEffect(() => {

        loadRequestServices();

        loadVehicleReleases();

    }, []);

    // FILTER REQUEST SERVICES

    const filteredRequestServices =
        requestServices.filter(
            (service) => {

                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                // REQUEST NUMBER

                const requestNumber =
                    service
                        .service_request_number
                        ?.toLowerCase() || "";

                // REQUEST DETAIL

                const requestDetail =
                    service
                        .request_detail
                        ?.toLowerCase() || "";

                // REQUEST PROOF

                const requestProof =
                    service
                        .request_proof
                        ?.toLowerCase() || "";

                // VEHICLE

                const vehicle =
                    service
                        .vehicle_release
                        ?.sale
                        ?.reservation
                        ?.vehicle;

                const brand =
                    vehicle
                        ?.brand
                        ?.brand
                        ?.toLowerCase() || "";

                const model =
                    vehicle
                        ?.model
                        ?.model
                        ?.toLowerCase() || "";

                const variant =
                    vehicle
                        ?.variant
                        ?.variant
                        ?.toLowerCase() || "";

                const vehicleName =
                    `${brand} ${model} ${variant}`
                        .trim();

                // SEARCH

                const matchesSearch =
                    keyword === "" ||

                    requestNumber.includes(
                        keyword
                    ) ||

                    requestDetail.includes(
                        keyword
                    ) ||

                    requestProof.includes(
                        keyword
                    ) ||

                    vehicleName.includes(
                        keyword
                    );

                // STATUS

                const matchesStatus =
                    status === "" ||

                    service.status === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    // SUCCESS AFTER REQUEST

    const handleRequestSuccess = async () => {

        onClose();

        await loadRequestServices();

        await loadVehicleReleases();
    };

    // PAGE

    return (
        <>
            <PageHeader
                title="Service Requests"
                subtitle="Ask for an oil change, repair or check-up for a car you bought from us."
                onRefresh={loadRequestServices}
                refreshing={loading}
            />

            <Grid
                mt={4}
                gap={4}
                templateColumns="1fr"
            >

                {/* TOOLBAR */}

                <GridItem minW={0}>

                    <RequestToolbar
                        search={search}

                        status={status}

                        onSearchChange={
                            setSearch
                        }

                        onStatusChange={
                            setStatus
                        }

                        onReload={
                            loadRequestServices
                        }

                        onAddRequest={
                            onOpen
                        }
                    />

                </GridItem>

                {/* REQUEST TABLE */}

                <GridItem minW={0}>

                    <RequestTable
                        requestServices={
                            filteredRequestServices
                        }

                        loading={loading}

                        onReload={
                            loadRequestServices
                        }
                    />

                </GridItem>

            </Grid>

            {/* ADD REQUEST SERVICE MODAL */}

            <AddRequestServiceModal
                isOpen={isOpen}

                onClose={onClose}

                vehicleReleases={
                    vehicleReleases
                }

                onSuccess={
                    handleRequestSuccess
                }
            />

        </>
    );
}