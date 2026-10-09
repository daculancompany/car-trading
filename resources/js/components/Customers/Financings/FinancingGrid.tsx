import { useState } from "react";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
  Tooltip,
} from "@chakra-ui/react";

import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  EyeIcon,
  IdentificationIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import { Link as RouterLink } from "react-router-dom";

import type { Financing } from "../../../api/FinancingManagement/financingInfoApi";
import ViewFinancingModal from "./ViewFinancingModal";

interface FinancingGridProps {
  financings: Financing[];
  loading?: boolean;
}

// Helpers

const formatCurrency = (amount?: number | null): string => {
  if (amount === null || amount === undefined) {
    return "₱0.00";
  }

  return `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatLoanTerm = (months?: number | null): string => {
  if (!months) {
    return "—";
  }

  return `${months} Months`;
};

const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "green";

    case "pending":
      return "yellow";

    case "rejected":
      return "red";

    case "completed":
      return "purple";

    default:
      return "blue";
  }
};

const formatStatus = (status?: string): string => {
  if (!status) {
    return "Unknown";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Component

export default function FinancingGrid({
  financings,
  loading = false,
}: FinancingGridProps) {
  const [selectedFinancing, setSelectedFinancing] =
    useState<Financing | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleViewFinancing = (financing: Financing) => {
    setSelectedFinancing(financing);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedFinancing(null);
  };

  return (
    <Box
      layerStyle="panel"
      p={{ base: 4, md: 5 }}
      overflow="hidden"
      mt={0}
    >
      {/* Header */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={2}
        mb={5}
      >
        <Box>
          <Heading size={{ base: "sm", md: "md" }}>
Your loan applications
          </Heading>

          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.500"
            mt={1}
          >
Each bank application, how much is financed, and where it stands.
          </Text>
        </Box>
      </Flex>

      {/* Loading */}
      {loading ? (
        <Flex
          justify="center"
          align="center"
          py={12}
          gap={3}
        >
          <Spinner size="md" color="blue.500" />

          <Text color="gray.500">
            Loading financing records...
          </Text>
        </Flex>
      ) : financings.length === 0 ? (
        /* Empty State */
        <Flex
          justify="center"
          align="center"
          py={12}
        >
          <VStack spacing={2}>
            <Icon
              as={BanknotesIcon}
              boxSize={10}
              color="gray.400"
            />

            <Text color="gray.500">
              No financing records found.
            </Text>
          </VStack>
        </Flex>
      ) : (
        /* Financing Cards */
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={{ base: 3, md: 4 }}
        >
          {financings.map((financing) => (
            <Box
              key={financing.id}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="xl"
              bg="white"
              overflow="hidden"
              transition="all 0.2s"
              _hover={{
                boxShadow: "md",
                borderColor: "gray.300",
                transform: "translateY(-2px)",
              }}
            >
              {/* Card Header */}
              <Flex
                px={{ base: 3, md: 4 }}
                py={3}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.200"
                justify="space-between"
                align="center"
                gap={2}
              >
                <HStack spacing={2} minW={0}>
                  <Flex
                    w="34px"
                    h="34px"
                    flexShrink={0}
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    bg="blue.50"
                  >
                    <Icon
                      as={BanknotesIcon}
                      boxSize={5}
                      color="blue.500"
                    />
                  </Flex>

                  <Box minW={0}>
<Text fontSize="sm" fontWeight="700" color="dark.800" noOfLines={1}>
                      {financing.company_name || "Bank loan"}
                    </Text>
                  </Box>
                </HStack>

                <Badge
                  colorScheme={getStatusColor(
                    financing.financing_status
                  )}
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="2xs"
                  flexShrink={0}
                >
                  {formatStatus(
                    financing.financing_status
                  )}
                </Badge>
              </Flex>

              {/* Card Body */}
              <VStack
                align="stretch"
                spacing={0}
                p={{ base: 3, md: 4 }}
              >
                {/* Finance Company */}
                <HStack
                  align="flex-start"
                  spacing={3}
                  mb={4}
                >
                  <Icon
                    as={IdentificationIcon}
                    boxSize={5}
                    color="gray.500"
                    mt={0.5}
                    flexShrink={0}
                  />

                  <Box minW={0}>
<Text fontSize="xs" color="gray.500">
                      For
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="dark.800" noOfLines={2}>
                      {[
                        (financing as any).reservation?.vehicle?.year_model,
                        (financing as any).reservation?.vehicle?.brand?.brand,
                        (financing as any).reservation?.vehicle?.model?.model,
                      ]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </Text>
                  </Box>
                </HStack>

                {/* Amount */}
                <Flex
                  justify="space-between"
                  align="center"
                  py={3}
                  borderTop="1px"
                  borderColor="gray.100"
                >
                  <HStack spacing={2}>
                    <Icon
                      as={CurrencyDollarIcon}
                      boxSize={4}
                      color="gray.500"
                    />

                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Financed Amount
                    </Text>
                  </HStack>

                  <Text
                    fontSize="sm"
                    fontWeight="700"
                    color="gray.800"
                    textAlign="right"
                  >
                    {formatCurrency(
                      financing.financed_amount
                    )}
                  </Text>
                </Flex>

                {/* Monthly Payment */}
                <Flex
                  justify="space-between"
                  align="center"
                  py={3}
                  borderTop="1px"
                  borderColor="gray.100"
                >
                  <HStack spacing={2}>
                    <Icon
                      as={BanknotesIcon}
                      boxSize={4}
                      color="gray.500"
                    />

                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Monthly Payment
                    </Text>
                  </HStack>

                  <Text
                    fontSize="sm"
                    fontWeight="700"
                    color="gray.800"
                    textAlign="right"
                  >
                    {formatCurrency(
                      financing.monthly_payment
                    )}
                  </Text>
                </Flex>

                {/* Loan Term */}
                <Flex
                  justify="space-between"
                  align="center"
                  py={3}
                  borderTop="1px"
                  borderColor="gray.100"
                >
                  <HStack spacing={2}>
                    <Icon
                      as={CalendarDaysIcon}
                      boxSize={4}
                      color="gray.500"
                    />

                    <Text
                      fontSize="xs"
                      color="gray.500"
                    >
                      Loan Term
                    </Text>
                  </HStack>

                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.800"
                  >
                    {formatLoanTerm(
                      financing.loan_term_months
                    )}
                  </Text>
                </Flex>

                {/* Rejected Notice */}
                {financing.financing_status ===
                  "rejected" && (
                    <Badge
                      colorScheme="red"
                      variant="subtle"
                      borderRadius="md"
                      px={3}
                      py={2}
                      mt={3}
                      whiteSpace="normal"
                    >
                      Resubmission Required
                    </Badge>
                  )}

                {/* Actions */}
                <Flex
                  gap={2}
                  mt={4}
                  pt={4}
                  borderTop="1px"
                  borderColor="gray.100"
                  justify="flex-end"
                >
                  <Tooltip label="View financing" placement="top">
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      aria-label="View financing"
                      onClick={() => handleViewFinancing(financing)}
                    >
                      <Icon
                        as={EyeIcon}
                        boxSize={5}
                      />
                    </Button>
                  </Tooltip>

                  {financing.financing_status ===
                    "rejected" && (
                      <Button
                        as={RouterLink}
                        to={`/customer-financings?resubmit=${financing.id}`}
                        flex="1"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        leftIcon={
                          <Icon
                            as={ArrowPathIcon}
                            boxSize={4}
                          />
                        }
                      >
                        Resubmit
                      </Button>
                    )}
                </Flex>
              </VStack>
            </Box>
          ))}
        </Grid>
      )}

      <ViewFinancingModal
        isOpen={isViewOpen}
        onClose={handleCloseView}
        financing={selectedFinancing}
      />
    </Box>
  );
}
