import {
    useEffect,
    useState,
} from "react";

import {
    Grid,
    GridItem,
} from "@chakra-ui/react";

import PageHeader
    from "../../components/Admin/Dashboard/DashboardPageHeader";

import RequestTable
    from "../../components/Admin/RequestServices/RequestTable";

import RequestToolbar
    from "../../components/Admin/RequestServices/RequestToolbar";

import {
    getRequestServices,
    type RequestService,
} from "../../api/JobOrderManagement/requestServiceApi";

import {
    getStaffs,
    type Staff,
} from "../../api/UserManagement/staffApi";

export default function AdminRequestServicePage() {

    // REQUEST SERVICES

    const [
        requestServices,
        setRequestServices,
    ] = useState<RequestService[]>([]);

    // STAFFS

    const [
        staffs,
        setStaffs,
    ] = useState<Staff[]>([]);

    // LOADING

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        loadingStaffs,
        setLoadingStaffs,
    ] = useState(false);

    // FILTER

    const [
        search,
        setSearch,
    ] = useState("");

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

            if (data.length > 0) {

            }

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

    // LOAD STAFFS

    const loadStaffs = async () => {

        try {

            setLoadingStaffs(true);

            const data =
                await getStaffs();

            if (data.length > 0) {

            }

            setStaffs(data);

        } catch (error) {

            console.error(
                "Failed to load staffs:",
                error
            );

            setStaffs([]);

        } finally {

            setLoadingStaffs(false);

        }

    };

    // INITIAL LOAD

    useEffect(() => {

        loadRequestServices();

        loadStaffs();

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

                // CUSTOMER

                const customer =
                    service
                        .vehicle_release
                        ?.sale
                        ?.reservation
                        ?.customer;

                const customerName = [
                    customer?.first_name,
                    customer?.middle_name,
                    customer?.last_name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

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

                    customerName.includes(
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

    // REFRESH EVERYTHING

    const handleReload = async () => {

        await Promise.all([
            loadRequestServices(),
            loadStaffs(),
        ]);

    };

    // PAGE

    return (
        <>

            {/* PAGE HEADER */}

            <PageHeader
                title="Service Requests"
                subtitle="Requests from customers who bought from us. Assign each one to a mechanic or washer."
                onRefresh={handleReload}
                refreshing={
                    loading ||
                    loadingStaffs
                }
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
                            handleReload
                        }
                    />

                </GridItem>

                {/* REQUEST SERVICE TABLE */}

                <GridItem minW={0}>

                    <RequestTable
                        requestServices={
                            filteredRequestServices
                        }

                        staffs={
                            staffs
                        }

                        loading={
                            loading ||
                            loadingStaffs
                        }

                        onReload={
                            handleReload
                        }
                    />

                </GridItem>

            </Grid>

        </>
    );
}