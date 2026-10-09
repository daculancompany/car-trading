import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Grid,
  GridItem,
  Link,
  useToast,
} from "@chakra-ui/react";

import {
  Link as RouterLink,
  useSearchParams,
} from "react-router-dom";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import FinancingTable from "../../components/Customers/Financings/FinancingGrid";
import ResubmitFinancingModal from "../../components/Customers/Financings/ResubmitFinancingModal";

import {
  getFinancings,
  type Financing,
} from "../../api/FinancingManagement/financingInfoApi";

import { showErrorToast } from "../../utils/apiToast";

// Component

export default function CustomerFinancingPage() {
  const [financings, setFinancings] =
    useState<Financing[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [resubmitFinancing, setResubmitFinancing] =
    useState<Financing | null>(null);

  const [searchParams] =
    useSearchParams();

  const toast = useToast();

  // Load Financing

  const loadFinancing = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await getFinancings();

        setFinancings(data);

        // Automatically open resubmit modal

        const resubmitId =
          Number(
            searchParams.get(
              "resubmit",
            ),
          );

        if (resubmitId) {
          const rejectedFinancing =
            data.find(
              (financing) =>
                financing.id ===
                  resubmitId &&
                financing.financing_status ===
                  "rejected",
            );

          if (rejectedFinancing) {
            setResubmitFinancing(
              rejectedFinancing,
            );
          }
        }
      } catch (error) {
        showErrorToast(
          toast,
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    [searchParams, toast],
  );

  // Initial Load

  useEffect(() => {
    loadFinancing();
  }, [loadFinancing]);

  // Rejected Financing

  const rejectedFinancings =
    financings.filter(
      (financing) =>
        financing.financing_status ===
        "rejected",
    );

  // Render

  return (
    <>
      <PageHeader
        title="My Financing"
        subtitle="Your bank loan application and its status."
        onRefresh={loadFinancing}
        refreshing={loading}
      />

      {/* Rejected Financing Alert */}

      {rejectedFinancings.length > 0 && (
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
                Financing application rejected
              </AlertTitle>

              <AlertDescription>
                Please review the financing
                remarks, update the financing
                information and documents, then
                resubmit the application for
                verification.{" "}

                <Link
                  as={RouterLink}
                  to={`/customer-financings?resubmit=${rejectedFinancings[0].id}`}
                  fontWeight="bold"
                  textDecoration="underline"
                >
                  Resubmit financing
                </Link>
              </AlertDescription>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Financing Table */}

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem minW={0}>
          <FinancingTable
            financings={financings}
            loading={loading}
          />
        </GridItem>
      </Grid>

      {/* Resubmit Modal */}

      <ResubmitFinancingModal
        isOpen={
          resubmitFinancing !== null
        }
        onClose={() =>
          setResubmitFinancing(null)
        }
        financing={
          resubmitFinancing
        }
        onResubmitted={
          loadFinancing
        }
      />
    </>
  );
}
