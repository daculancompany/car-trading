import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";

import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { downloadSalesReportPdf } from "../../../api/Reports/reportApi";

interface AdminSaleToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
}

export default function AdminSaleToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: AdminSaleToolbarProps) {
  const toast = useToast();

  const handleDownloadFilteredPdf = async () => {
    try {
      const blob = await downloadSalesReportPdf({
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sales-filtered-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download filtered sales PDF:", error);
      toast({
        title: "Download failed",
        description: "Unable to download the filtered sales PDF.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <Box
      layerStyle="panel"
      px={{ base: 4, md: 5 }}
      py={4}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        gap={4}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          flex="1"
          gap={4}
        >
          {/* SEARCH */}

          <InputGroup flex="1">
            <InputLeftElement
              pointerEvents="none"
              h="100%"
            >
              <MagnifyingGlassIcon
                width={17}
                height={17}
                color="currentColor"
                style={{
                  color: "#A0AEC0",
                }}
              />
            </InputLeftElement>

            <Input
              size="sm"
              placeholder="Search invoice, customer, vehicle..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              bg="white"
              borderColor="gray.300"
              rounded="md"
              _hover={{
                borderColor: "gray.400",
              }}
              _focus={{
                borderColor: "brand.500",
                boxShadow:
                  "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
            />
          </InputGroup>

          {/* STATUS */}

          <Select
            size="sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            w={{
              base: "100%",
              md: "220px",
            }}
            bg="white"
            borderColor="gray.300"
            rounded="md"
            _hover={{
              borderColor: "gray.400",
            }}
            _focus={{
              borderColor: "brand.500",
              boxShadow:
                "0 0 0 1px var(--chakra-colors-brand-500)",
            }}
          >
            <option value="">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </Select>

          <Input
            type="date"
            size="sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="Sales start date"
            w={{ base: "100%", md: "160px" }}
          />

          <Input
            type="date"
            size="sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="Sales end date"
            w={{ base: "100%", md: "160px" }}
          />

          <Button
            size="sm"
            colorScheme="red"
            leftIcon={<ArrowDownTrayIcon width={16} height={16} />}
            onClick={() => void handleDownloadFilteredPdf()}
            whiteSpace="nowrap"
          >
            Download PDF
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

