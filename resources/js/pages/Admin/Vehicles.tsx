import { useEffect, useState } from "react";
import { Grid, GridItem, useToast } from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import VehicleToolbar from "../../components/Admin/Vehicles/VehicleToolbar";
import VehicleTable from "../../components/Admin/Vehicles/VehicleTable";

import {
  getVehicles,
  type Vehicle,
} from "../../api/VehicleManagement/vehicleApi";

import { showErrorToast } from "../../utils/apiToast";

export default function AdminVehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const toast = useToast();

  /**
   * Load Vehicles
   */
  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await getVehicles();

      // getVehicles() already returns Vehicle[]
      setVehicles(response);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      showErrorToast(toast, error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial Load
   */
  useEffect(() => {
    loadVehicles();
  }, []);

  /**
   * Filter Vehicles
   */
  const filteredVehicles = vehicles.filter((vehicle) => {
    const brand = vehicle.brand?.brand?.toLowerCase() ?? "";
    const model = vehicle.model?.model?.toLowerCase() ?? "";
    const variant = vehicle.variant?.variant?.toLowerCase() ?? "";
    const color = vehicle.color?.toLowerCase() ?? "";
    const year = vehicle.year_model?.toString() ?? "";
    const stockNo = vehicle.stock_no?.toLowerCase() ?? "";

    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      keyword === "" ||
      brand.includes(keyword) ||
      model.includes(keyword) ||
      variant.includes(keyword) ||
      stockNo.includes(keyword) ||
      color.includes(keyword) ||
      year.includes(keyword);

    const matchesStatus =
      statusFilter === "" ||
      vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /**
   * Render
   */
  return (
    <>
      <PageHeader
        title="Vehicles"
        subtitle="Stock on the lot, with specs, photos, documents and expenses per unit."
        onRefresh={loadVehicles}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem>
          <VehicleToolbar
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onVehicleAdded={loadVehicles}
          />
        </GridItem>

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