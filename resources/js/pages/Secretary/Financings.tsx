import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";

import PageHeader from "../../components/Secretary/Dashboard/DashboardPageHeader";
import FinancingToolbar from "../../components/Secretary/Financings/FinancingToolbar";
import FinancingTable from "../../components/Secretary/Financings/FinancingTable";

import {
  getFinancings,
  type Financing,
  type FinancingStatus,
} from "../../api/FinancingManagement/financingInfoApi";

export default function SecretaryFinancingPage() {
  // State

  const [financings, setFinancings] = useState<Financing[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FinancingStatus | "">("");

  // Load Financings

  const loadFinancings = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getFinancings();

      setFinancings(data);
    } catch (error) {
      console.error("Failed to load financings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load

  useEffect(() => {
    loadFinancings();
  }, [loadFinancings]);

  // Filter Financings

  const filteredFinancings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return financings.filter((financing) => {
      const customerName = [
        financing.reservation?.customer?.first_name,
        financing.reservation?.customer?.middle_name,
        financing.reservation?.customer?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const reservationId = String(
        financing.reservation_id,
      );

      const matchesSearch =
        !search ||
        customerName.includes(search) ||
        reservationId.includes(search);

      const matchesStatus =
        !statusFilter ||
        financing.financing_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [financings, searchTerm, statusFilter]);

  // Render

  return (
    <>
      <PageHeader
        title="Financing"
        subtitle="Bank loan applications linked to reservations."
        onRefresh={loadFinancings}
        refreshing={loading}
      />
      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        {/* Toolbar */}

        <GridItem minW={0}>
          <FinancingToolbar
            financings={financings}
            loading={loading}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
          />
        </GridItem>

        {/* Table */}

        <GridItem minW={0}>
          <FinancingTable
            financings={filteredFinancings}
            loading={loading}
          />
        </GridItem>
      </Grid>
    </>
  );
}