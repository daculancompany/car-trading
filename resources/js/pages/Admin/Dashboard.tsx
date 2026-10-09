import { Grid, GridItem, Stack } from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import DashboardOverview from "../../components/Admin/Dashboard/DashboardStatCard";
import DashboardSalesChart from "../../components/Admin/Dashboard/DashboardSalesTrend";
import DashboardVehicleStatus from "../../components/Admin/Dashboard/DashboardVehicleStatus";
import DashboardRecentReservations from "../../components/Admin/Dashboard/DashboardRecentReservations";
import DashboardReservationPipeline from "../../components/Admin/Dashboard/DashboardReservationPipeline";
import DashboardLatestVehicles from "../../components/Admin/Dashboard/DashboardLatestVehicles";
import DashboardPendingJobOrders from "../../components/Admin/Dashboard/DashboardJobOrders";
import DashboardTopSelling from "../../components/Admin/Dashboard/DashboardTopSelling";
import DashboardFinancialPerformance from "../../components/Admin/Dashboard/DashboardFinancialPerformance";

// Shared by the Admin and Secretary portals.
export default function DashboardPage() {
  return (
    <Stack spacing={4} w="full">
      <PageHeader
        title="Dashboard"
        subtitle="Today at a glance: reservations, payments, sales and shop work."
      />

      {/* This month, inventory, and the to-do list */}
      <DashboardOverview />

      <DashboardReservationPipeline />

      <Grid gap={4} templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }}>
        <GridItem minW={0} display="flex"><DashboardSalesChart /></GridItem>
        <GridItem minW={0} display="flex"><DashboardFinancialPerformance /></GridItem>
      </Grid>

      <Grid gap={4} templateColumns={{ base: "1fr", xl: "minmax(0, 7fr) minmax(0, 3fr)" }}>
        <GridItem minW={0} display="flex"><DashboardTopSelling /></GridItem>
        <GridItem minW={0} display="flex"><DashboardVehicleStatus /></GridItem>
      </Grid>

      <DashboardRecentReservations />

      <Grid gap={4} templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }}>
        <GridItem minW={0}><DashboardPendingJobOrders /></GridItem>
        <GridItem minW={0}><DashboardLatestVehicles /></GridItem>
      </Grid>
    </Stack>
  );
}
