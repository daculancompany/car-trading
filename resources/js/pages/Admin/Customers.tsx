import { useEffect, useState } from "react";
import { Grid, GridItem } from "@chakra-ui/react";

import PageHeader from "../../components/Admin/Dashboard/DashboardPageHeader";
import CustomerTable from "../../components/Admin/Customers/CustomerTable";
import CustomerToolbar from "../../components/Admin/Customers/CustomerToolbar";

import {
  getCustomers,
  type Customer,
} from "../../api/UserManagement/customerApi";

export default function AdminCustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // LOAD CUSTOMERS
  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    loadCustomers();
  }, []);

  // FILTER CUSTOMERS
  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.trim().toLowerCase();

    // FULL NAME
    const fullName = [
      customer.first_name,
      customer.middle_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // OTHER SEARCHABLE FIELDS
    const username =
      customer.user?.username?.toLowerCase() || "";

    const email =
      customer.user?.email?.toLowerCase() || "";

    const mobileNumber =
      customer.mobile_number?.toLowerCase() || "";

    const matchesSearch =
      keyword === "" ||
      fullName.includes(keyword) ||
      username.includes(keyword) ||
      email.includes(keyword) ||
      mobileNumber.includes(keyword);

    // CUSTOMER STATUS
    //
    // Laravel/MySQL may return:
    // true / false
    // OR
    // 1 / 0
    // OR
    // "1" / "0"
    //
    // Convert the value to a reliable boolean.
    const isActive =
      Number(customer.is_active) === 1;

    const matchesStatus =
      status === "" ||
      (status === "active" && isActive) ||
      (status === "inactive" && !isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Registered buyers and their reservations, payments and releases."
        onRefresh={loadCustomers}
        refreshing={loading}
      />

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        {/* CUSTOMER TOOLBAR */}
        <GridItem minW={0}>
          <CustomerToolbar
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onReload={loadCustomers}
          />
        </GridItem>

        {/* CUSTOMER TABLE */}
        <GridItem minW={0}>
          <CustomerTable
            customers={filteredCustomers}
            loading={loading}
            onReload={loadCustomers}
          />
        </GridItem>
      </Grid>
    </>
  );
}
