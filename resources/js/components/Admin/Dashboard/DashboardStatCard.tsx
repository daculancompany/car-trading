import { useEffect, useState, type ComponentType } from "react";
import {
  Box,
  Flex,
  Grid,
  Icon,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  BanknotesIcon,
  ChevronRightIcon,
  DocumentMagnifyingGlassIcon,
  IdentificationIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { Link as RouterLink } from "react-router-dom";

import {
  getDashboardStats,
  type DashboardStats,
} from "../../../api/DashboardManagement/dashboardStatApi";
import { getUser } from "../../../utils/auth";

const peso = (value: number) =>
  `₱${Math.round(Number(value) || 0).toLocaleString("en-PH")}`;

// Admin and Secretary use the same pages under different URL prefixes.
const portalPrefix = () => {
  const role = String(getUser()?.role?.name ?? "").toLowerCase();
  return role === "admin" ? "/admin" : "/secretary";
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) =>
        setError(err?.response?.data?.message ?? "Could not load the dashboard numbers.")
      );
  }, []);

  if (error) {
    return (
      <Box layerStyle="panel" px={5} py={6}>
        <Text color="red.500" fontSize="sm">{error}</Text>
      </Box>
    );
  }

  const prefix = portalPrefix();
  const monthName = new Date().toLocaleDateString("en-PH", { month: "long" });

  const attention = [
    { label: "IDs to review", count: stats?.attention.ids_to_review, to: `${prefix}-reservations`, icon: IdentificationIcon },
    { label: "Payments to verify", count: stats?.attention.payments_to_verify, to: `${prefix}-payments`, icon: BanknotesIcon },
    { label: "Bank documents to check", count: stats?.attention.documents_to_check, to: `${prefix}-documents`, icon: DocumentMagnifyingGlassIcon },
    { label: "Service requests to assign", count: stats?.attention.unassigned_requests, to: `${prefix}-request-services`, icon: WrenchScrewdriverIcon },
    { label: "Units waiting for release", count: stats?.attention.releases_pending, to: `${prefix}-releases`, icon: TruckIcon },
  ];

  const inventory = [
    { label: "In stock", value: stats?.total_inventory },
    { label: "Available", value: stats?.available_vehicles },
    { label: "Reserved", value: stats?.reserved_vehicles },
    { label: "Sold", value: stats?.vehicles_sold },
    { label: "In the shop", value: stats?.under_maintenance },
    { label: "Open job orders", value: stats?.pending_job_orders },
    { label: "Customers", value: stats?.customers },
    { label: "Active staff", value: stats?.staff },
  ];

  return (
    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 3fr) minmax(0, 2fr)" }} gap={4}>
      <Stack spacing={4} minW={0}>
        <Box layerStyle="panel" px={5} py={4}>
          <Text fontSize="sm" fontWeight="700" color="dark.800" mb={3}>
            {monthName} so far
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            <Money label="Sales" value={stats?.monthly_sales} note="Completed sales this month" />
            <Money
              label="Profit"
              value={stats?.monthly_profit}
              note={stats ? `After ${peso(stats.cost_of_units_sold)} cost of units sold` : undefined}
              tone={stats && stats.monthly_profit < 0 ? "red.600" : "green.600"}
            />
            <Money label="Expenses" value={stats?.total_expenses} note="Vehicle costs and parts used" />
          </SimpleGrid>
        </Box>

        <Box layerStyle="panel" px={5} py={4}>
          <Text fontSize="sm" fontWeight="700" color="dark.800" mb={3}>
            Inventory and shop
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacingX={4} spacingY={3}>
            {inventory.map((item) => (
              <Box key={item.label}>
                <Text fontSize="xs" color="gray.500">{item.label}</Text>
                <Skeleton isLoaded={Boolean(stats)} mt={0.5}>
                  <Text fontSize="xl" fontWeight="800" color="dark.900">{item.value ?? 0}</Text>
                </Skeleton>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Stack>

      <Box layerStyle="panel" px={5} py={4} minW={0}>
        <Flex justify="space-between" align="baseline" mb={2}>
          <Text fontSize="sm" fontWeight="700" color="dark.800">Needs attention</Text>
          <Text fontSize="xs" color="gray.500">Waiting on staff</Text>
        </Flex>
        <Stack spacing={0} divider={<Box borderBottom="1px solid" borderColor="gray.100" />}>
          {attention.map((item) => {
            const count = item.count ?? 0;
            return (
              <LinkBox
                key={item.label}
                as={Flex}
                align="center"
                gap={3}
                py={2.5}
                px={1}
                borderRadius="md"
                _hover={{ bg: "gray.50" }}
              >
                <Icon as={item.icon as ComponentType} boxSize={5} color={count > 0 ? "brand.600" : "gray.400"} />
                <LinkOverlay as={RouterLink} to={item.to} flex="1" fontSize="sm" color="gray.700">
                  {item.label}
                </LinkOverlay>
                <Skeleton isLoaded={Boolean(stats)}>
                  <Text
                    minW="28px"
                    textAlign="center"
                    fontSize="sm"
                    fontWeight="700"
                    px={2}
                    borderRadius="full"
                    bg={count > 0 ? "brand.50" : "gray.100"}
                    color={count > 0 ? "brand.700" : "gray.500"}
                  >
                    {count}
                  </Text>
                </Skeleton>
                <Icon as={ChevronRightIcon as ComponentType} boxSize={4} color="gray.400" />
              </LinkBox>
            );
          })}
        </Stack>
      </Box>
    </Grid>
  );
}

function Money({ label, value, note, tone = "dark.900" }: { label: string; value?: number; note?: string; tone?: string }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500">{label}</Text>
      <Skeleton isLoaded={value !== undefined} mt={0.5}>
        <Text fontSize="2xl" fontWeight="800" color={tone} letterSpacing="-0.02em">
          {peso(value ?? 0)}
        </Text>
      </Skeleton>
      {note && <Text fontSize="xs" color="gray.500" mt={0.5}>{note}</Text>}
    </Box>
  );
}
