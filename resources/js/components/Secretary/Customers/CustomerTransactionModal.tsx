import { useEffect, useState } from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Badge,
    Box,
    Divider,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    Stat,
    StatLabel,
    StatNumber,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    VStack,
    useToast,
} from "@chakra-ui/react";

import { updateCustomerPhoto, type Customer } from "../../../api/UserManagement/customerApi";
import PhotoPicker from "../../Shared/Customers/PhotoPicker";

import { getReservations } from "../../../api/ReservationManagement/reservationApi";
import { getPayments } from "../../../api/PaymentManagement/paymentApi";
import { getVehicleReleases } from "../../../api/VehicleManagement/releaseApi";
import { getSales } from "../../../api/SaleManagement/saleApi";

import { formatPeso } from "../../../utils/numberFormatter";

import CustomerInfo from "../Customers/Transactions/CustomerInfo";
import CustomerReservations from "../Customers/Transactions/CustomerReservations";
import CustomerPayments from "../Customers/Transactions/CustomerPayments";
import CustomerRelease from "../Customers/Transactions/CustomerRelease";

interface CustomerTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onChanged?: () => void;
}

export default function CustomerTransactionModal({
    isOpen,
    onClose,
    customer,
    onChanged,
}: CustomerTransactionModalProps) {
    const toast = useToast();
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [savingPhoto, setSavingPhoto] = useState(false);

    useEffect(() => {
        setPhotoUrl(customer?.image_url ?? null);
    }, [customer]);

    const handlePhoto = async (file: File | null) => {
        if (!customer) return;

        try {
            setSavingPhoto(true);
            const updated = await updateCustomerPhoto(customer.id, file);
            setPhotoUrl(updated.image_url ?? null);
            toast({ title: file ? "Photo updated." : "Photo removed.", status: "success", duration: 2500 });
            onChanged?.();
        } catch (error) {
            console.error("Failed to update customer photo:", error);
            toast({ title: "Failed to update photo.", status: "error", duration: 3000 });
        } finally {
            setSavingPhoto(false);
        }
    };

    // SUMMARY STATS
    const [summary, setSummary] = useState({
        reservations: 0,
        totalPayments: 0,
        purchased: 0,
        released: 0,
    });

    useEffect(() => {
        if (!isOpen || !customer) {
            return;
        }

        const loadSummary = async () => {
            try {
                const [reservations, payments, releases, sales] =
                    await Promise.all([
                        getReservations(),
                        getPayments(),
                        getVehicleReleases(),
                        getSales(),
                    ]);

                const customerReservations = reservations.filter(
                    (reservation) =>
                        reservation.customer_id === customer.id
                );

                const customerPayments = payments.filter(
                    (payment) =>
                        payment.reservation?.customer_id ===
                        customer.id
                );

                const customerReleases = releases.filter(
                    (release) =>
                        release.sale?.reservation?.customer_id ===
                        customer.id
                );

                const customerSales = sales.filter(
                    (sale) =>
                        sale.reservation?.customer_id === customer.id
                );

                const totalPayments = customerPayments
                    .filter(
                        (payment) =>
                            payment.payment_status === "verified"
                    )
                    .reduce(
                        (sum, payment) => sum + payment.amount,
                        0
                    );

                setSummary({
                    reservations: customerReservations.length,
                    totalPayments,
                    purchased: customerSales.length,
                    released: customerReleases.filter(
                        (release) => release.status === "released"
                    ).length,
                });
            } catch (error) {
                console.error(
                    "Failed to load customer transaction summary:",
                    error
                );
            }
        };

        loadSummary();
    }, [isOpen, customer]);

    if (!customer) return null;

    // CUSTOMER FULL NAME
    const fullName = [
        customer.first_name,
        customer.middle_name,
        customer.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    // CUSTOMER STATUS
    const isActive = customer.is_active;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="6xl"
            scrollBehavior="inside"
        >
            <ModalOverlay />

            <ModalContent borderRadius="xl">
                {/* HEADER */}
                <ModalHeader>
                    Customer Transactions
                </ModalHeader>

                <ModalCloseButton />

                <ModalBody pb={6}>
                    {/* CUSTOMER PROFILE HEADER */}
                    <Flex
                        justify="space-between"
                        align={{ base: "flex-start", md: "center" }}
                        wrap="wrap"
                        gap={5}
                        mb={6}
                    >
                        <HStack
                            align="flex-start"
                            spacing={4}
                        >
                            <PhotoPicker
                                size="xl"
                                name={fullName}
                                currentUrl={photoUrl}
                                value={null}
                                onChange={(file) => file && handlePhoto(file)}
                                onRemoveCurrent={() => handlePhoto(null)}
                                isLoading={savingPhoto}
                            />

                            <VStack
                                align="start"
                                spacing={1}
                            >
                                <Heading size="md">
                                    {fullName}
                                </Heading>

                                <Text color="gray.600">
                                    Customer ID:{" "}
                                    <strong>
                                        CST-
                                        {String(customer.id).padStart(
                                            4,
                                            "0"
                                        )}
                                    </strong>
                                </Text>

                                <Text color="gray.600">
                                    Username:{" "}
                                    <strong>
                                        {customer.user?.username ?? "-"}
                                    </strong>
                                </Text>

                                <Text color="gray.600">
                                    Email:{" "}
                                    <strong>
                                        {customer.user?.email ?? "-"}
                                    </strong>
                                </Text>

                                <Text color="gray.600">
                                    Registered:{" "}
                                    <strong>
                                        {customer.date_registered
                                            ? new Date(
                                                customer.date_registered
                                            ).toLocaleDateString()
                                            : customer.created_at
                                                ? new Date(
                                                    customer.created_at
                                                ).toLocaleDateString()
                                                : "-"}
                                    </strong>
                                </Text>
                            </VStack>
                        </HStack>

                        {/* STATUS */}
                        <Badge
                            colorScheme={
                                isActive ? "green" : "red"
                            }
                            px={4}
                            py={2}
                            rounded="md"
                            fontSize="sm"
                            textTransform="capitalize"
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </Flex>

                    {/* SUMMARY */}
                    <Grid
                        templateColumns={{
                            base: "repeat(2, 1fr)",
                            lg: "repeat(4, 1fr)",
                        }}
                        gap={4}
                        mb={6}
                    >
                        {/* Reservations */}
                        <GridItem>
                            <Box
                                borderWidth="1px"
                                borderColor="gray.200"
                                rounded="lg"
                                p={4}
                                bg="white"
                            >
                                <Stat>
                                    <StatLabel>
                                        Reservations
                                    </StatLabel>

                                    <StatNumber>
                                        {summary.reservations}
                                    </StatNumber>
                                </Stat>
                            </Box>
                        </GridItem>

                        {/* Payments */}
                        <GridItem>
                            <Box
                                borderWidth="1px"
                                borderColor="gray.200"
                                rounded="lg"
                                p={4}
                                bg="white"
                            >
                                <Stat>
                                    <StatLabel>
                                        Total Payments
                                    </StatLabel>

                                    <StatNumber>
                                        {formatPeso(summary.totalPayments)}
                                    </StatNumber>
                                </Stat>
                            </Box>
                        </GridItem>

                        {/* Purchased */}
                        <GridItem>
                            <Box
                                borderWidth="1px"
                                borderColor="gray.200"
                                rounded="lg"
                                p={4}
                                bg="white"
                            >
                                <Stat>
                                    <StatLabel>
                                        Purchased
                                    </StatLabel>

                                    <StatNumber>
                                        {summary.purchased}
                                    </StatNumber>
                                </Stat>
                            </Box>
                        </GridItem>

                        {/* Released */}
                        <GridItem>
                            <Box
                                borderWidth="1px"
                                borderColor="gray.200"
                                rounded="lg"
                                p={4}
                                bg="white"
                            >
                                <Stat>
                                    <StatLabel>
                                        Released
                                    </StatLabel>

                                    <StatNumber>
                                        {summary.released}
                                    </StatNumber>
                                </Stat>
                            </Box>
                        </GridItem>
                    </Grid>

                    <Divider mb={5} />

                    {/* CUSTOMER TRANSACTION TABS */}
                    <Tabs
                        variant="enclosed"
                        colorScheme="blue"
                        isLazy
                    >
                        <TabList overflowX="auto">
                            <Tab>
                                Customer
                            </Tab>

                            <Tab>
                                Reservations
                            </Tab>

                            <Tab>
                                Payments
                            </Tab>

                            <Tab>
                                Vehicle Release
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {/* Customer Information */}
                            <TabPanel px={0}>
                                <CustomerInfo
                                    customer={customer}
                                />
                            </TabPanel>

                            {/* Reservations */}
                            <TabPanel px={0}>
                                <CustomerReservations
                                    customerId={customer.id}
                                />
                            </TabPanel>

                            {/* Payments */}
                            <TabPanel px={0}>
                                <CustomerPayments
                                    customerId={customer.id}
                                />
                            </TabPanel>

                            {/* Vehicle Release */}
                            <TabPanel px={0}>
                                <CustomerRelease
                                    customerId={customer.id}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>

                {/* FOOTER */}
                <ModalFooter>
                    <Button
                        colorScheme="gray"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
