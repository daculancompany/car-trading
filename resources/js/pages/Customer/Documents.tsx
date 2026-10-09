import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import DocumentTable from "../../components/Customers/Documents/DocumentTable";

import {
  getFinancingDocuments,
  type FinancingDocument,
} from "../../api/FinancingManagement/documentApi";

import { showErrorToast } from "../../utils/apiToast";

export default function CustomerDocumentPage() {
  const [documents, setDocuments] = useState<FinancingDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getFinancingDocuments();

      setDocuments(data);
    } catch (error) {
      showErrorToast(toast, error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const rejectedDocuments = useMemo(() => {
    const latestByRequirement = new Map<number, FinancingDocument>();

    [...documents]
      .sort((first, second) => {
        const firstDate = new Date(
          first.created_at ?? first.uploaded_at,
        ).getTime();
        const secondDate = new Date(
          second.created_at ?? second.uploaded_at,
        ).getTime();

        return secondDate - firstDate || second.id - first.id;
      })
      .forEach((document) => {
        if (!latestByRequirement.has(document.financing_requirement_id)) {
          latestByRequirement.set(document.financing_requirement_id, document);
        }
      });

    return Array.from(latestByRequirement.values()).filter(
      (document) => document.verification_status === "rejected",
    );
  }, [documents]);

  return (
    <>
      <PageHeader
        title="My Documents"
        subtitle="Bank requirements you uploaded and whether they were accepted."
        onRefresh={loadDocuments}
        refreshing={loading}
      />

      {rejectedDocuments.length > 0 && (
        <Box mt={4}>
          <Alert
            status="error"
            variant="left-accent"
            borderRadius="md"
            alignItems="flex-start"
          >
            <AlertIcon mt={1} />
            <Box>
              <AlertTitle>
                Document resubmission required
              </AlertTitle>
              <AlertDescription>
                {rejectedDocuments.length} financing document
                {rejectedDocuments.length === 1 ? " was" : "s were"} rejected.
                Please review the remarks and upload the rejected document
                {rejectedDocuments.length === 1 ? " again" : "s again"}.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      )}

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem minW={0}>
          <DocumentTable
            documents={documents}
            loading={loading}
            onReload={loadDocuments}
          />
        </GridItem>
      </Grid>
    </>
  );
}