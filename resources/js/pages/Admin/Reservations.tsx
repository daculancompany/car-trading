import { useEffect, useState } from "react";
import {
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";

import { showErrorToast } from "../../utils/apiToast";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import ReservationToolbar from "../../components/Admin/Reservations/ReservationToolbar";
import ReservationTable from "../../components/Admin/Reservations/ReservationTable";

import {
  getReservations,
  type Reservation,
} from "../../api/ReservationManagement/reservationApi";

export default function AdminReservationPage() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const toast = useToast();

  // Load Reservations

  const loadReservations = async () => {
    try {
      setLoading(true);

      const response = await getReservations();

      // IMPORTANT
      // getReservations() already returns Reservation[].
      // Do NOT use:
      // response.data
      // response.success

      setReservations(response);
    } catch (error) {
      console.error(
        "Failed to load reservations:",
        error,
      );

      setReservations([]);

      showErrorToast(
        toast,
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial Load

  useEffect(() => {
    loadReservations();
  }, []);

  // Filter Reservations

  const filteredReservations =
    reservations.filter((reservation) => {
      // Customer Name

      const customerName = reservation.customer
        ? [
          reservation.customer.first_name,
          reservation.customer.middle_name,
          reservation.customer.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        : "";

      // Vehicle Name

      const vehicleName = reservation.vehicle
        ? [
          reservation.vehicle.brand?.brand,
          reservation.vehicle.model?.model,
          reservation.vehicle.variant?.variant,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        : "";

      // Stock Number

      const stockNumber =
        reservation.vehicle?.stock_no
          ?.toLowerCase() ?? "";

      // Reservation Source

      const reservationSource =
        reservation.reservation_source
          ?.toLowerCase() ?? "";

      // Purchase Option

      const purchaseOption =
        reservation.purchase_option
          ?.toLowerCase() ?? "";

      // Search Keyword

      const keyword =
        search.trim().toLowerCase();

      // Search Match

      const matchesSearch =
        keyword === "" ||
        customerName.includes(keyword) ||
        vehicleName.includes(keyword) ||
        stockNumber.includes(keyword) ||
        reservationSource.includes(keyword) ||
        purchaseOption.includes(keyword);

      // Status Match

      const matchesStatus =
        statusFilter === "" ||
        reservation.reservation_status ===
        statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // UI

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Check IDs, approve reservations and follow each one until release."
        onRefresh={loadReservations}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        {/* RESERVATION TOOLBAR */}

        <GridItem>
          <ReservationToolbar
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
          // onReservationAdded={
          //   loadReservations
          // }
          />
        </GridItem>

        {/* RESERVATION TABLE */}

        <GridItem>
          <ReservationTable
            reservations={
              filteredReservations
            }
            loading={loading}
            onReload={loadReservations}
          />
        </GridItem>
      </Grid>
    </>
  );
}