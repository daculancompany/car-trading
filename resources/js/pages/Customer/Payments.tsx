import { useEffect, useState } from "react";

import {
    Grid,
    GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Customers/Dashboard/DashboardPageHeader";
import PaymentSummary from "../../components/Customers/Payments/PaymentSummary";
import PaymentTable from "../../components/Customers/Payments/PaymentTable";
import CustomerPayRemainingBalance from "../../components/Customers/Payments/CustomerPaymentBalanceModal";

import {
    getPayments,
    type Payment,
} from "../../api/PaymentManagement/paymentApi";

export default function CustomerPaymentPage() {
    // STATE

    const [
        selectedReservationId,
        setSelectedReservationId,
    ] = useState<number | null>(null);

    const [payments, setPayments] =
        useState<Payment[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [
        isBalanceModalOpen,
        setIsBalanceModalOpen,
    ] = useState(false);

    const [
        selectedPayment,
        setSelectedPayment,
    ] = useState<Payment | null>(null);

    // LOAD PAYMENTS

    const loadPayments = async () => {
        try {
            setLoading(true);

            const data = await getPayments();

            setPayments(data);

            if (
                data.length > 0 &&
                selectedReservationId === null
            ) {
                setSelectedReservationId(
                    data[0].reservation_id
                );
            }
        } catch (error) {
            console.error(
                "Failed to load payments:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // INITIAL LOAD

    useEffect(() => {
        loadPayments();
    }, []);

    // PAY BALANCE

    const handlePayBalance = (
        payment: Payment
    ) => {
        setSelectedPayment(payment);
        setIsBalanceModalOpen(true);
    };

    // CLOSE BALANCE MODAL

    const handleCloseBalanceModal = () => {
        setIsBalanceModalOpen(false);
        setSelectedPayment(null);
    };

    // CALCULATE REMAINING BALANCE

    const getRemainingBalance = (
        payment: Payment | null
    ): number => {
        if (!payment) {
            return 0;
        }

        // Same rule as the payment summary: price less discount, verified and pending payments.
        const sellingPrice = Number(payment.reservation?.vehicle?.selling_price ?? 0);
        const sale = payments.find(
            (item) => item.reservation_id === payment.reservation_id && item.sale
        )?.sale;
        const discount = Number(sale?.discount_amount ?? 0);

        const settled = payments
            .filter(
                (item) =>
                    item.reservation_id === payment.reservation_id &&
                    (item.payment_status === "verified" || item.payment_status === "pending")
            )
            .reduce((total, item) => total + Number(item.amount), 0);

        return Math.max(sellingPrice - discount - settled, 0);
    };

    const remainingBalance =
        getRemainingBalance(
            selectedPayment
        );

    // RENDER

    return (
        <>
            {/* PAGE HEADER */}

            <PageHeader
                title="My Payments"
                subtitle="What you have paid, what is still being checked, and the remaining balance."
                onRefresh={loadPayments}
                refreshing={loading}
            />

            {/* PAYMENT CONTENT */}

            <Grid
                mt={4}
                gap={4}
                templateColumns="1fr"
            >
                {/* PAYMENT SUMMARY */}

                <GridItem>
                    <PaymentSummary
                        payments={payments}
                        selectedReservationId={
                            selectedReservationId
                        }
                        onReservationChange={
                            setSelectedReservationId
                        }
                    />
                </GridItem>

                {/* PAYMENT TABLE */}

                <GridItem>
                    <PaymentTable
                        payments={payments}
                        loading={loading}
                        onReload={loadPayments}
                        onPayBalance={
                            handlePayBalance
                        }
                    />
                </GridItem>
            </Grid>

            {/* PAY REMAINING BALANCE MODAL */}

            <CustomerPayRemainingBalance
                isOpen={
                    isBalanceModalOpen
                }
                onClose={
                    handleCloseBalanceModal
                }
                payment={
                    selectedPayment
                }
                remainingBalance={
                    remainingBalance
                }
                onPaid={
                    loadPayments
                }
            />
        </>
    );
}