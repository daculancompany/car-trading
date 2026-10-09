import { useEffect, useState } from "react";

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

import { showErrorToast } from "../../utils/apiToast";
import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import ReservationTable from "../../components/Customers/Reservations/ReservationTable";

import {
    getReservations,
    type Reservation,
} from "../../api/ReservationManagement/reservationApi";
import { getFinancings } from "../../api/FinancingManagement/financingInfoApi";
import { getFinancingDocuments } from "../../api/FinancingManagement/documentApi";
import { useSearchParams } from "react-router-dom";

export default function CustomerReservationPage() {

    const [reservations, setReservations] =
        useState<Reservation[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [financingReservationToOpen, setFinancingReservationToOpen] =
        useState<number | null>(null);

    const [paymentReservationToOpen, setPaymentReservationToOpen] =
        useState<number | null>(null);

    const [verifiedFinancingReservationIds, setVerifiedFinancingReservationIds] =
        useState<number[]>([]);

    const [searchParams] = useSearchParams();

    const toast = useToast();

    // Load Reservations

    const loadReservations = async () => {

        try {

            setLoading(true);

            const [response, financings, financingDocuments] =
                await Promise.all([
                    getReservations(),
                    getFinancings(),
                    getFinancingDocuments(),
                ]);

            setReservations(response);

            const verifiedReservationIds = financings.flatMap((financing) => {
                const latestDocuments = new Map<number, typeof financingDocuments[number]>();

                financingDocuments
                    .filter((document) => Number(document.financing_info_id) === Number(financing.id))
                    .sort((first, second) => {
                        const firstDate = new Date(first.created_at ?? first.uploaded_at).getTime();
                        const secondDate = new Date(second.created_at ?? second.uploaded_at).getTime();
                        return secondDate - firstDate || second.id - first.id;
                    })
                    .forEach((document) => {
                        if (!latestDocuments.has(document.financing_requirement_id)) {
                            latestDocuments.set(document.financing_requirement_id, document);
                        }
                    });

                const latest = Array.from(latestDocuments.values());

                return latest.length > 0 &&
                    latest.every((document) => document.verification_status === "verified")
                    ? [financing.reservation_id]
                    : [];
            });

            setVerifiedFinancingReservationIds(verifiedReservationIds);

            const resubmitReservationId = Number(
                searchParams.get("resubmit"),
            );

            if (
                resubmitReservationId > 0 &&
                response.some(
                    (reservation) =>
                        reservation.id === resubmitReservationId &&
                        reservation.purchase_option === "financing",
                )
            ) {
                setFinancingReservationToOpen(resubmitReservationId);
            }

        } catch (error) {

            console.error(
                "Failed to load reservations:",
                error
            );

            setReservations([]);

            showErrorToast(
                toast,
                error
            );

        } finally {

            setLoading(false);

        }

    };

    // Initial Load

    useEffect(() => {

        loadReservations();

    }, [searchParams]);

    const financingRequirementsPending = reservations.some(
        (reservation) =>
            reservation.purchase_option === "financing" &&
            reservation.reservation_status === "pending_financing" &&
            !verifiedFinancingReservationIds.includes(reservation.id),
    );

    const firstFinancingReservation = reservations.find(
        (reservation) =>
            reservation.purchase_option === "financing" &&
            reservation.reservation_status === "pending_financing" &&
            !verifiedFinancingReservationIds.includes(reservation.id),
    );

    const financingPaymentPending = reservations.some(
        (reservation) =>
            reservation.purchase_option === "financing" &&
            (reservation.reservation_status === "pending_payment" ||
                verifiedFinancingReservationIds.includes(reservation.id)),
    );

    const firstFinancingPaymentReservation = reservations.find(
        (reservation) =>
            reservation.purchase_option === "financing" &&
            (reservation.reservation_status === "pending_payment" ||
                verifiedFinancingReservationIds.includes(reservation.id)),
    );

    // UI

    return (
        <>
            {/* PAGE HEADER */}

            <PageHeader
                title="My Reservations"
                subtitle="Where each reservation stands and what is left to do."
                onRefresh={loadReservations}
                refreshing={loading}
            />

            {financingRequirementsPending && (
                <Box mt={4}>
                    <Alert
                        status="warning"
                        variant="left-accent"
                        borderRadius="md"
                        alignItems="flex-start"
                    >
                        <AlertIcon mt={1} />
                        <Box>
                            <AlertTitle>
                                Financing requirements are ready
                            </AlertTitle>
                            <AlertDescription>
                                Your financing payment method has been verified.
                                Please submit all required financing documents to
                                continue your reservation.{" "}
                                <Link
                                    href="#reservations"
                                    fontWeight="bold"
                                    textDecoration="underline"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        if (firstFinancingReservation) {
                                            setFinancingReservationToOpen(
                                                firstFinancingReservation.id,
                                            );
                                        }
                                    }}
                                >
                                    Open financing requirements
                                </Link>
                            </AlertDescription>
                        </Box>
                    </Alert>
                </Box>
            )}

            {financingPaymentPending && (
                <Box mt={4}>
                    <Alert
                        status="success"
                        variant="left-accent"
                        borderRadius="md"
                        alignItems="flex-start"
                    >
                        <AlertIcon mt={1} />
                        <Box>
                            <AlertTitle>
                                Financing requirements verified
                            </AlertTitle>
                            <AlertDescription>
                                Your financing payment method and required documents
                                have been verified. Please proceed to the next payment
                                step to continue your reservation.{" "}
                                <Link
                                    href="#reservations"
                                    fontWeight="bold"
                                    textDecoration="underline"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        if (firstFinancingPaymentReservation) {
                                            setPaymentReservationToOpen(
                                                firstFinancingPaymentReservation.id,
                                            );
                                        }
                                    }}
                                >
                                    Open payment modal
                                </Link>
                            </AlertDescription>
                        </Box>
                    </Alert>
                </Box>
            )}

            {/* RESERVATION GRID */}

            <Grid
                mt={4}
                gap={4}
                templateColumns="1fr"
            >

                <GridItem>

                    <ReservationTable
                        reservations={reservations}
                        loading={loading}
                        onReload={loadReservations}
                        openFinancingReservationId={financingReservationToOpen}
                        onFinancingReservationOpened={() =>
                            setFinancingReservationToOpen(null)
                        }
                        openFinancingPaymentReservationId={paymentReservationToOpen}
                        onFinancingPaymentReservationOpened={() =>
                            setPaymentReservationToOpen(null)
                        }
                    />

                </GridItem>

            </Grid>
        </>
    );

}