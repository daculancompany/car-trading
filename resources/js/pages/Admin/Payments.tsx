import { useEffect, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";

import PaymentToolbar from "../../components/Admin/Payments/PaymentToolbar";
import PaymentTable from "../../components/Admin/Payments/PaymentTable";

import {
  getPayments,
  type Payment,
} from "../../api/PaymentManagement/paymentApi";

export default function AdminPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);

      const data = await getPayments();

      setPayments(data);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      payment.reference_number
        ?.toLowerCase()
        .includes(searchValue) ||
      payment.reservation_id
        .toString()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "" ||
      payment.payment_status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Verify GCash and bank receipts, record cash payments, and manage payment accounts."
        onRefresh={loadPayments}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem>
          <PaymentToolbar
            search={search}
            statusFilter={statusFilter}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
            onPaymentAdded={loadPayments}
            onPaymentAccountAdded={loadPayments}
          />
        </GridItem>

        <GridItem>
          <PaymentTable
            payments={filteredPayments}
            loading={loading}
            onReload={loadPayments}
          />
        </GridItem>
      </Grid>
    </>
  );
}