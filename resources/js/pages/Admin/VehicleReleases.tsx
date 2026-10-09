import { useEffect, useState } from "react";

import {
    Grid,
    GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";

import ReleaseToolbar from "../../components/Admin/VehicleReleases/ReleaseToolbar";
import ReleaseTable from "../../components/Admin/VehicleReleases/ReleaseTable";

import {
    getVehicleReleases,
    type VehicleRelease,
} from "../../api/VehicleManagement/releaseApi";

export default function AdminReleasePage() {
    // VEHICLE RELEASES

    const [releases, setReleases] =
        useState<VehicleRelease[]>([]);

    // LOADING

    const [loading, setLoading] =
        useState(false);

    // SEARCH

    const [search, setSearch] =
        useState("");

    // STATUS FILTER

    const [statusFilter, setStatusFilter] =
        useState("");

    // LOAD VEHICLE RELEASES

    const loadReleases = async () => {
        try {
            setLoading(true);

            const data =
                await getVehicleReleases();

            setReleases(data);
        } catch (error) {
            console.error(
                "Failed to load vehicle releases:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // INITIAL LOAD

    useEffect(() => {
        loadReleases();
    }, []);

    // FILTER VEHICLE RELEASES

    const filteredReleases =
        releases.filter((release) => {

            // SALE

            const sale =
                release.sale;

            // RESERVATION

            const reservation =
                sale?.reservation;

            // CUSTOMER

            const customer =
                reservation?.customer;

            const customerName = customer
                ? [
                    customer.first_name,
                    customer.middle_name,
                    customer.last_name,
                ]
                    .filter(Boolean)
                    .join(" ")
                : "";

            // VEHICLE

            const vehicle =
                reservation?.vehicle;

            const vehicleText = vehicle
                ? [
                    vehicle.stock_no,
                    vehicle.year_model,
                    vehicle.color,
                    vehicle.brand?.brand,
                    vehicle.model?.model,
                    vehicle.variant?.variant,
                ]
                    .filter(Boolean)
                    .join(" ")
                : "";

            // SEARCH

            const keyword =
                search
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                keyword === "" ||

                release.release_number
                    .toLowerCase()
                    .includes(keyword) ||

                sale?.invoice_number
                    ?.toLowerCase()
                    .includes(keyword) ||

                customerName
                    .toLowerCase()
                    .includes(keyword) ||

                vehicleText
                    .toLowerCase()
                    .includes(keyword);

            // STATUS

            const matchesStatus =
                statusFilter === "" ||
                release.status === statusFilter;

            // FINAL RESULT

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    // RENDER

    return (
        <>
            {/* PAGE HEADER */}

            <PageHeader
                title="Vehicle Releases"
                subtitle="Release sold units and print the receipt and deed of sale."
                onRefresh={loadReleases}
                refreshing={loading}
            />

            {/* PAGE CONTENT */}

            <Grid
                mt={4}
                gap={4}
                templateColumns="1fr"
            >

                {/* RELEASE TOOLBAR */}

                <GridItem>
                    <ReleaseToolbar
                        search={search}
                        setSearch={setSearch}
                        statusFilter={
                            statusFilter
                        }
                        setStatusFilter={
                            setStatusFilter
                        }
                    />
                </GridItem>

                {/* RELEASE TABLE */}

                <GridItem>
                    <ReleaseTable
                        releases={
                            filteredReleases
                        }
                        loading={loading}
                        onRefresh={
                            loadReleases
                        }
                    />
                </GridItem>

            </Grid>
        </>
    );
}