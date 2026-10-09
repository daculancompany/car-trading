import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import FinancingToolbar from "../../components/Admin/Financings/FinancingToolbar";
import FinancingTable from "../../components/Admin/Financings/FinancingTable";

import {
  getFinancings,
  type Financing,
  type FinancingStatus,
} from "../../api/FinancingManagement/financingInfoApi";

import {
  getFinancingDocuments,
} from "../../api/FinancingManagement/documentApi";

export default function AdminFinancingInfoPage() {
  const [financings, setFinancings] =
    useState<Financing[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<FinancingStatus | "">("");

  const loadFinancings = useCallback(async () => {
    try {
      setLoading(true);

      const [data, documents] = await Promise.all([
        getFinancings(),
        getFinancingDocuments(),
      ]);

      const financingList = Array.isArray(data)
        ? data
        : [];

      const documentList = Array.isArray(documents)
        ? documents
        : [];

      const financingsWithDocuments: Financing[] =
        financingList.map((financing) => ({
          ...financing,
          documents: documentList
            .filter(
              (document) =>
                Number(document.financing_info_id) ===
                Number(financing.id),
            )
            .map((document) => ({
              ...document,
              financing: undefined,
            })),
        }));

      setFinancings(financingsWithDocuments);
    } catch (error) {
      console.error(
        "Failed to load financings:",
        error,
      );

      setFinancings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancings();
  }, [loadFinancings]);

  const filteredFinancings = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

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

      const companyName =
        financing.company_name
          ?.toLowerCase() ?? "";

      const referenceNumber =
        financing.financing_reference_no
          ?.toLowerCase() ?? "";

      const matchesSearch =
        !search ||
        customerName.includes(search) ||
        reservationId.includes(search) ||
        companyName.includes(search) ||
        referenceNumber.includes(search);

      const matchesStatus =
        !statusFilter ||
        financing.financing_status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    financings,
    searchTerm,
    statusFilter,
  ]);

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

        <GridItem minW={0}>
          <FinancingTable
            financings={filteredFinancings}
            loading={loading}
            onRefresh={loadFinancings}
          />
        </GridItem>
      </Grid>
    </>
  );
}