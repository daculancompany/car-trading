import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import PageHeader from "../../components/Secretary/Dashboard/DashboardPageHeader";
import DocumentToolbar from "../../components/Secretary/Documents/DocumentToolbar";
import DocumentTable from "../../components/Secretary/Documents/DocumentTable";

import {
  getFinancingDocuments,
  type FinancingDocument,
} from "../../api/FinancingManagement/documentApi";

export default function SecretaryDocumentPage() {
  // State

  const [documents, setDocuments] = useState<
    FinancingDocument[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    FinancingDocument["verification_status"] | ""
  >("");

  // Load Documents

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getFinancingDocuments();

      setDocuments(data);
    } catch (error) {
      console.error(
        "Failed to load financing documents:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Filter Documents

  const filteredDocuments = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return documents.filter((document) => {
      const fileName =
        document.file_name?.toLowerCase() ?? "";

      const requirementName =
        document.financing_requirement
          ?.requirement_name
          ?.toLowerCase() ?? "";

      const financingId =
        document.financing_info_id?.toString() ?? "";

      const matchesSearch =
        !search ||
        fileName.includes(search) ||
        requirementName.includes(search) ||
        financingId.includes(search);

      const matchesStatus =
        !statusFilter ||
        document.verification_status ===
        statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    documents,
    searchTerm,
    statusFilter,
  ]);

  // Render

  return (
    <>
      <PageHeader
        title="Financing Documents"
        subtitle="Check the bank requirements customers upload. Approve or ask for a new copy."
        onRefresh={loadDocuments}
        refreshing={loading}
      />
      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        {/* Toolbar */}

        <GridItem minW={0}>
          <DocumentToolbar
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
          />
        </GridItem>

        {/* Table */}

        <GridItem minW={0}>
          <DocumentTable
            documents={filteredDocuments}
            loading={loading}
            onRefresh={loadDocuments}
          />
        </GridItem>
      </Grid>
    </>
  );
}