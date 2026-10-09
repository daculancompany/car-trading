import {
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import {
    Grid,
    GridItem,
    useToast,
} from "@chakra-ui/react";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import VehicleToolbar from "../../components/Customers/Vehicles/VehicleToolbar";
import VehicleTable from "../../components/Customers/Vehicles/VehicleGridBrowser";

import {
    getVehicles,
    getVehicleCustomer,
    type Vehicle,
} from "../../api/VehicleManagement/vehicleApi";

import { showErrorToast } from "../../utils/apiToast";

export default function CustomerVehiclePage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [brandFilter, setBrandFilter] = useState("");

    const toast = useToast();

    // LOAD VEHICLES FROM BOTH APIs

    const loadVehicles = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch both APIs
            const [publicVehicles, customerVehicles] =
                await Promise.all([
                    getVehicles(),
                    getVehicleCustomer(),
                ]);

            // MERGE VEHICLES USING VEHICLE ID

            const vehicleMap = new Map<number, Vehicle>();

            // Add all public vehicles first
            publicVehicles.forEach((vehicle) => {
                vehicleMap.set(vehicle.id, vehicle);
            });

            // Add customer-specific information
            // This overrides matching vehicle information
            customerVehicles.forEach((vehicle) => {
                const existingVehicle = vehicleMap.get(vehicle.id);

                vehicleMap.set(vehicle.id, {
                    ...existingVehicle,
                    ...vehicle,
                });
            });

            const mergedVehicles = Array.from(
                vehicleMap.values()
            );

            setVehicles(mergedVehicles);
        } catch (error) {
            console.error("Failed to load vehicles:", error);

            showErrorToast(toast, error);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // INITIAL LOAD

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // AVAILABLE BRANDS

    const brands = useMemo<string[]>(() => {
        return Array.from(
            new Set(
                vehicles
                    .map((vehicle) => vehicle.brand?.brand)
                    .filter(
                        (brand): brand is string => Boolean(brand)
                    )
            )
        ).sort();
    }, [vehicles]);

    // SEARCH + BRAND FILTER

    const filteredVehicles = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return vehicles.filter((vehicle) => {
            // SEARCH

            const searchableText = `
        ${vehicle.brand?.brand ?? ""}
        ${vehicle.model?.model ?? ""}
        ${vehicle.variant?.variant ?? ""}
        ${vehicle.year_model ?? ""}
        ${vehicle.color ?? ""}
      `.toLowerCase();

            const matchesSearch =
                keyword === "" ||
                searchableText.includes(keyword);

            // BRAND FILTER

            const matchesBrand =
                brandFilter === "" ||
                vehicle.brand?.brand === brandFilter;

            return matchesSearch && matchesBrand;
        });
    }, [vehicles, search, brandFilter]);

    // UI

    return (
        <>
            <PageHeader
                title="Cars for Sale"
                subtitle="Units available right now. Reserve one to hold it for 7 days."
                onRefresh={loadVehicles}
                refreshing={loading}
            />

            <Grid
                mt={4}
                gap={4}
                templateColumns="1fr"
            >
                {/* TOOLBAR */}

                <GridItem>
                    <VehicleToolbar
                        search={search}
                        brandFilter={brandFilter}
                        brands={brands}
                        onSearchChange={setSearch}
                        onBrandChange={setBrandFilter}
                    />
                </GridItem>

                {/* VEHICLE GRID */}

                <GridItem>
                    <VehicleTable
                        vehicles={filteredVehicles}
                        loading={loading}
                        onReload={loadVehicles}
                    />
                </GridItem>
            </Grid>
        </>
    );
}