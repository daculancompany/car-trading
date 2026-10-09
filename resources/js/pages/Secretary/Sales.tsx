import { useEffect, useState } from "react";

import {
  Grid,
  GridItem,
} from "@chakra-ui/react";

import PageHeader from "../../components/Secretary/Dashboard/DashboardPageHeader";

import SaleToolbar from "../../components/Secretary/Sales/SaleToolbar";
import SalesTable from "../../components/Secretary/Sales/SaleTable";

import {
  getSales,
  type Sale,
} from "../../api/SaleManagement/saleApi";

export default function SecretarySalePage() {
  // Sales

  const [sales, setSales] =
    useState<Sale[]>([]);

  // Loading

  const [loading, setLoading] =
    useState(false);

  // Search

  const [search, setSearch] =
    useState("");

  // Status Filter

  const [statusFilter, setStatusFilter] =
    useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Load Sales

  const loadSales = async () => {
    try {
      setLoading(true);

      const data =
        await getSales();

      setSales(data);
    } catch (error) {
      console.error(
        "Failed to load sales:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial Load

  useEffect(() => {
    loadSales();
  }, []);

  // Filter Sales

  const filteredSales =
    sales.filter((sale) => {
      // Reservation
      const reservation =
        sale.reservation;

      // Customer

      const customer =
        reservation?.customer;

      const customerName = customer
        ? [
          customer.first_name,
          customer.middle_name,
          customer.last_name,
        ]
          .filter(Boolean)
          .join(" ")
        : "";

      // Vehicle

      const vehicle =
        reservation?.vehicle;

      const vehicleText = vehicle
        ? [
          vehicle.stock_no,
          vehicle.year_model,
          vehicle.color,
          vehicle.brand?.brand,
          vehicle.model?.model,
          vehicle.variant?.variant,
        ]
          .filter(Boolean)
          .join(" ")
        : "";

      // Search Keyword

      const keyword =
        search
          .toLowerCase()
          .trim();

      // Search Match

      const matchesSearch =
        keyword === "" ||
        sale.invoice_number
          .toLowerCase()
          .includes(keyword) ||
        customerName
          .toLowerCase()
          .includes(keyword) ||
        vehicleText
          .toLowerCase()
          .includes(keyword);

      // Status Match

      const matchesStatus =
        statusFilter === "" ||
        sale.status ===
        statusFilter;

      const saleDate = new Date(sale.sale_date);
      const endDate = toDate ? new Date(`${toDate}T23:59:59`) : null;
      const startDate = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const matchesDateRange =
        (!startDate || saleDate >= startDate) &&
        (!endDate || saleDate <= endDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDateRange
      );
    });

  // Render

  return (
    <>
      {/* PAGE HEADER */}

      <PageHeader
        title="Sales"
        subtitle="Invoices for every unit sold, with discounts and status."
        onRefresh={loadSales}
        refreshing={loading}
      />

      {/* PAGE CONTENT */}

      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        <GridItem>
          <SaleToolbar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
          />
        </GridItem>

        {/* SALES TABLE */}

        <GridItem>
          <SalesTable
            sales={filteredSales}
            loading={loading}
          />
        </GridItem>
      </Grid>
    </>
  );
}