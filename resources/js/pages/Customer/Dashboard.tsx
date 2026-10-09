import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  KeyIcon,
  PhotoIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import { EmptyState, LoadingState, Section, StatTile } from "../../components/Shared/ui";
import { getReservations, type Reservation } from "../../api/ReservationManagement/reservationApi";
import { getPayments, type Payment } from "../../api/PaymentManagement/paymentApi";
import { getRequestServices, type RequestService } from "../../api/JobOrderManagement/requestServiceApi";

const peso = (value: number) => `₱${Math.round(value).toLocaleString("en-PH")}`;
const shortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";
const label = (value?: string | null) =>
  String(value ?? "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const ACTIVE = ["pending_reservation", "pending_documents", "pending_financing", "pending_payment", "reserved"];

const statusScheme: Record<string, string> = {
  pending_reservation: "yellow",
  pending_documents: "orange",
  pending_financing: "purple",
  pending_payment: "orange",
  reserved: "blue",
  completed: "green",
  cancelled: "gray",
  expired: "gray",
  pending: "yellow",
  assigned: "blue",
  in_progress: "purple",
};

const vehicleName = (vehicle?: any) =>
  [vehicle?.year_model, vehicle?.brand?.brand, vehicle?.model?.model, vehicle?.variant?.variant]
    .filter(Boolean)
    .join(" ") || "Vehicle";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requests, setRequests] = useState<RequestService[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p, s] = await Promise.all([getReservations(), getPayments(), getRequestServices()]);
      setReservations(r);
      setPayments(p);
      setRequests(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusOf = (r: Reservation) => String((r as any).reservation_status ?? "").toLowerCase();
  const firstName = (reservations[0] as any)?.customer?.first_name as string | undefined;

  // Money still owed per reservation: price less discount, verified and pending payments.
  const balanceFor = useCallback(
    (reservationId: number) => {
      const mine = payments.filter((p) => p.reservation_id === reservationId);
      const sale: any = mine.find((p: any) => p.sale)?.sale;
      const price = Number((mine[0] as any)?.reservation?.vehicle?.selling_price ?? 0);
      const settled = (status: string) =>
        mine.filter((p) => p.payment_status === status).reduce((t, p) => t + Number(p.amount), 0);
      return {
        remaining: Math.max(price - Number(sale?.discount_amount ?? 0) - settled("verified") - settled("pending"), 0),
        pending: settled("pending"),
        rejected: mine.filter((p) => p.payment_status === "rejected").length,
        hasPayments: mine.length > 0,
      };
    },
    [payments],
  );

  // One clear next step per active reservation.
  const nextSteps = useMemo(
    () =>
      reservations
        .filter((r) => ACTIVE.includes(statusOf(r)))
        .map((r) => {
          const status = statusOf(r);
          const money = balanceFor(r.id);
          let text = "";
          let action: { label: string; to: string } | null = null;

          const idNeedsFix =
            (r as any).valid_id_front_status === "resubmit" || (r as any).valid_id_back_status === "resubmit";

          if (idNeedsFix) {
            text = "Our staff asked for a clearer photo of your ID.";
            action = { label: "Upload ID again", to: "/customer-reservations" };
          } else if (status === "pending_reservation") {
            text = "We're checking your ID. You'll get a notification once it's approved.";
          } else if (status === "pending_documents") {
            text = "Upload the bank requirements so the loan can be processed.";
            action = { label: "Upload documents", to: "/customer-documents" };
          } else if (status === "pending_financing") {
            text = "Your documents are with the bank. We'll let you know when they decide.";
          } else if (money.rejected > 0 && money.pending === 0) {
            text = "A payment was rejected. Check the remarks and send the correct receipt.";
            action = { label: "View payments", to: "/customer-payments" };
          } else if (money.pending > 0) {
            text = `${peso(money.pending)} is waiting for our staff to verify.${money.remaining > 0 ? ` ${peso(money.remaining)} left after that.` : ""}`;
            action = { label: "View payments", to: "/customer-payments" };
          } else if (money.remaining > 0 || !money.hasPayments) {
            text = money.hasPayments ? `${peso(money.remaining)} left to pay before release.` : "Pay the reservation fee to hold the unit.";
            action = { label: "Pay now", to: "/customer-payments" };
          } else {
            text = "Fully paid. We'll schedule the release and send you the papers.";
          }

          return { reservation: r, status, text, action };
        }),
    [reservations, balanceFor],
  );

  const pendingTotal = payments.filter((p) => p.payment_status === "pending").reduce((t, p) => t + Number(p.amount), 0);
  const owned = reservations.filter((r) => statusOf(r) === "completed").length;
  const openRequests = requests.filter((r) => !["completed", "cancelled"].includes(String(r.status))).length;

  return (
    <Stack spacing={4} w="full">
      <PageHeader
        title={firstName ? `Hi, ${firstName}` : "My Dashboard"}
        subtitle="Your reservations, payments and service requests in one place."
        onRefresh={load}
        refreshing={loading}
      />

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        <StatTile label="Active reservations" value={nextSteps.length} icon={CalendarDaysIcon} />
        <StatTile label="Cars you own" value={owned} icon={KeyIcon} />
        <StatTile
          label="Being verified"
          value={peso(pendingTotal)}
          note="Payments our staff is checking"
          tone={pendingTotal > 0 ? "yellow.600" : "dark.900"}
          icon={BanknotesIcon}
        />
        <StatTile label="Open service requests" value={openRequests} icon={WrenchScrewdriverIcon} />
      </SimpleGrid>

      <Section title="What's next" subtitle="What each of your reservations needs from you.">
        {loading ? (
          <LoadingState />
        ) : nextSteps.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title="Nothing to do right now"
            message="Reserve a unit and we'll guide you through each step here."
            action={
              <Button size="sm" colorScheme="brand" onClick={() => navigate("/customer-vehicles")}>
                See cars for sale
              </Button>
            }
          />
        ) : (
          <Stack spacing={3}>
            {nextSteps.map(({ reservation, status, text, action }) => {
              const vehicle: any = (reservation as any).vehicle;
              const cover = vehicle?.images?.[0]?.image_path;
              return (
                <Flex
                  key={reservation.id}
                  gap={4}
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                  p={3}
                  border="1px solid"
                  borderColor="gray.100"
                  borderRadius="md"
                >
                  <HStack spacing={3} flex="1" minW={0} align="center">
                    <Box w="88px" h="60px" flexShrink={0} borderRadius="md" overflow="hidden" bg="gray.100">
                      {cover ? (
                        <Image src={`/storage/${cover}`} alt="" w="100%" h="100%" objectFit="cover" />
                      ) : (
                        <Flex h="100%" align="center" justify="center"><Icon as={PhotoIcon} color="gray.400" /></Flex>
                      )}
                    </Box>
                    <Box minW={0}>
                      <HStack spacing={2} flexWrap="wrap">
                        <Text fontWeight="700" color="dark.900" noOfLines={1}>{vehicleName(vehicle)}</Text>
                        <Badge colorScheme={statusScheme[status] ?? "gray"} borderRadius="full" fontSize="10px">
                          {label(status)}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" mt={0.5}>{text}</Text>
                      <Text fontSize="xs" color="gray.400" mt={0.5}>
                        RES-{String(reservation.id).padStart(3, "0")} · hold until {shortDate((reservation as any).expires_at)}
                      </Text>
                    </Box>
                  </HStack>
                  {action && (
                    <Button size="sm" colorScheme="brand" flexShrink={0} onClick={() => navigate(action.to)}>
                      {action.label}
                    </Button>
                  )}
                </Flex>
              );
            })}
          </Stack>
        )}
      </Section>

      <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap={4}>
        <Section
          title="Reservation history"
          action={<Button size="xs" variant="ghost" onClick={() => navigate("/customer-reservations")}>See all</Button>}
        >
          {reservations.length === 0 ? (
            <EmptyState title="No reservations yet" />
          ) : (
            <Stack spacing={0} divider={<Box borderBottom="1px solid" borderColor="gray.100" />}>
              {reservations.slice(0, 5).map((r) => (
                <Flex key={r.id} py={2.5} justify="space-between" gap={3} align="center">
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="dark.800" noOfLines={1}>{vehicleName((r as any).vehicle)}</Text>
                    <Text fontSize="xs" color="gray.500">
                      RES-{String(r.id).padStart(3, "0")} · reserved {shortDate((r as any).reserved_at)}
                    </Text>
                  </Box>
                  <Badge colorScheme={statusScheme[statusOf(r)] ?? "gray"} borderRadius="full" fontSize="10px" flexShrink={0}>
                    {label(statusOf(r))}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          )}
        </Section>

        <Section
          title="Service requests"
          action={<Button size="xs" variant="ghost" onClick={() => navigate("/customer-request-services")}>See all</Button>}
        >
          {requests.length === 0 ? (
            <EmptyState title="No service requests" message="Need an oil change or repair? Request it from Service Requests." />
          ) : (
            <Stack spacing={0} divider={<Box borderBottom="1px solid" borderColor="gray.100" />}>
              {requests.slice(0, 5).map((s) => (
                <Flex key={s.id} py={2.5} justify="space-between" gap={3} align="center">
                  <Box minW={0}>
                    <Text fontSize="sm" fontWeight="600" color="dark.800" noOfLines={1}>{s.request_detail}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {vehicleName(s.vehicle_release?.sale?.reservation?.vehicle)} · {s.service_request_number}
                    </Text>
                  </Box>
                  <Badge colorScheme={statusScheme[String(s.status)] ?? "gray"} borderRadius="full" fontSize="10px" flexShrink={0}>
                    {label(String(s.status))}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          )}
        </Section>
      </Grid>
    </Stack>
  );
}
