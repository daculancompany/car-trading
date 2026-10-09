import { useEffect, useState } from "react";

import {
  Badge,
  Box,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Heading,
  Flex,
  Text,
  IconButton,
  useDisclosure,
  useToast,
  Tooltip,
  Button,
} from "@chakra-ui/react";

import {
  ArrowDownTrayIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import {
  downloadSalePdf,
  type Sale,
} from "../../../api/SaleManagement/saleApi";
import CustomerSaleReportModal from "./CustomerSaleReport";
import SalesReportModal from "./SalesReportModal";
import Pagination from "../../../Reusable/Paginations";
import CustomerAvatar from "../../Shared/Customers/CustomerAvatar";
import DetailsLink from "../../Shared/Details/DetailsLink";

interface SalesProps {
  sales: Sale[];
  loading: boolean;
}

export default function SalesTable({
  sales,
  loading,
}: SalesProps) {

  const [selectedReportSale, setSelectedReportSale] = useState<Sale | null>(null);

  const {
    isOpen: isCustomerReportOpen,
    onOpen: onCustomerReportOpen,
    onClose: onCustomerReportClose,
  } = useDisclosure();

  const {
    isOpen: isSalesReportOpen,
    onOpen: onSalesReportOpen,
    onClose: onSalesReportClose,
  } = useDisclosure();

  const handleCustomerReport = (sale: Sale) => {
    setSelectedReportSale(sale);
    onCustomerReportOpen();
  };

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();

  // Reset Page When Sales Change

  useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  // Pagination Start

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // Paginated Sales

  const paginatedSales = sales.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Status Color

  const statusColor = {
    pending: "yellow",
    completed: "green",
    cancelled: "red",
  } as const;

  // Format Currency

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDownloadPdf = async (sale: Sale) => {
    try {
      const blob = await downloadSalePdf(sale.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sale.invoice_number || `sale-${sale.id}`}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download sale PDF:", error);
      toast({
        title: "Download failed",
        description: "Unable to download this sale PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Render

  return (
    <Box
      layerStyle="panel"
      overflow="hidden"
    >
      {/* HEADER */}

      <Box
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={3}
        >
          <Box>
            <Heading size="sm" color="gray.800">
              Sales Transactions
            </Heading>
          </Box>

          <Button
            size="sm"
            colorScheme="blue"
            onClick={onSalesReportOpen}
          >
            Sales Report
          </Button>
        </Flex>
      </Box>

      {/* TABLE */}

      <Box overflowX="auto">
        <Table variant="simple" minW="980px">
          <Thead bg="gray.50">
            <Tr>
              {["Invoice No.",
                "Customer",
                "Vehicle",
                "Sale Date",
                "Total Amount",
                "Status",
                "Actions"].map(
                  (header) => (
                    <Th
                      key={header}
                      isNumeric={header === "Total Amount"}
                      textAlign={header === "Actions" ? "center" : undefined}
                      fontSize="xs"
                      fontWeight="800"
                      color="gray.700"
                      py={2}
                    >
                      {header}
                    </Th>
                  )
                )}
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={12}>
                  <Text fontSize="sm" color="gray.500">Loading sales...</Text>
                </Td>
              </Tr>
            ) : sales.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={12}>
                  <Text fontSize="sm" color="gray.500">No sales transactions found.</Text>
                </Td>
              </Tr>
            ) : (
              paginatedSales.map((sale) => {
                const reservation = sale.reservation;
                const customer = reservation?.customer;
                const vehicle = reservation?.vehicle;

                const customerName = customer
                  ? [customer.first_name, customer.middle_name, customer.last_name].filter(Boolean).join(" ")
                  : "-";

                const vehicleName = vehicle
                  ? [vehicle.brand?.brand, vehicle.model?.model, vehicle.variant?.variant].filter(Boolean).join(" ")
                  : "-";

                const sellingPrice = Number(vehicle?.selling_price ?? 0);
                const discount = Number(sale.discount_amount ?? 0);
                const totalAmount = Math.max(sellingPrice - discount, 0);

                return (
                  <Tr key={sale.id} _hover={{ bg: "gray.50" }} transition="background-color 0.15s ease">
                    <Td py={2}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800" whiteSpace="nowrap">
                        {sale.invoice_number}
                      </Text>
                    </Td>

                    <Td py={2}>
                      <CustomerAvatar customer={customer} withName name={customerName} />
                    </Td>

                    <Td py={2}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800" whiteSpace="nowrap">
                        <DetailsLink type="vehicle" id={vehicle?.id}>{vehicleName}</DetailsLink>
                      </Text>
                      {vehicle && (
                        <Text fontSize="xs" color="gray.500" mt={0.5} whiteSpace="nowrap">
                          • {vehicle.stock_no}
                        </Text>
                      )}
                    </Td>

                    <Td py={2}>
                      <Text fontSize="sm" color="gray.700" whiteSpace="nowrap">
                        {sale.sale_date
                          ? new Date(sale.sale_date).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          : "-"}
                      </Text>
                    </Td>

                    <Td py={2} isNumeric>
                      <Text fontSize="sm" fontWeight="700" color="gray.800" whiteSpace="nowrap">
                        ₱{formatCurrency(totalAmount)}
                      </Text>
                      {discount > 0 && (
                        <Text fontSize="xs" color="gray.500" mt={0.5} whiteSpace="nowrap">
                          Discount: ₱{formatCurrency(discount)}
                        </Text>
                      )}
                    </Td>

                    <Td py={2}>
                      <Badge
                        colorScheme={statusColor[sale.status]}
                        px={2}
                        py={1}
                        rounded="md"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                      >
                        {sale.status}
                      </Badge>
                    </Td>

                    <Td py={2}>
                      <HStack justify="center" spacing={1}>
                        <Tooltip label="Customer sale report" placement="top">
                          <IconButton
                            aria-label="View customer sale report"
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            icon={<ChartBarIcon width={17} height={17} />}
                            onClick={() => handleCustomerReport(sale)}
                            _hover={{ bg: "green.50", color: "green.500" }}
                          />
                        </Tooltip>

                        <Tooltip label="Download sale PDF" placement="top">
                          <IconButton
                            aria-label="Download sale PDF"
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            icon={<ArrowDownTrayIcon width={17} height={17} />}
                            onClick={() => void handleDownloadPdf(sale)}
                            _hover={{ bg: "red.50", color: "red.500" }}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

      <CustomerSaleReportModal
        isOpen={isCustomerReportOpen}
        onClose={onCustomerReportClose}
        sale={selectedReportSale}
      />

      <SalesReportModal
        isOpen={isSalesReportOpen}
        onClose={onSalesReportClose}
        sales={sales}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={sales.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemLabel="sale"
      />
    </Box>
  );
}