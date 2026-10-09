import {
  Grid,
  GridItem,
  useToast,
} from "@chakra-ui/react";

import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "../../components/Secretary/Dashboard/DashboardPageHeader";

import AdminJobOrderToolbar from "../../components/Secretary/JobOrders/JobOrderToolbar";
import AdminJobOrderTable from "../../components/Secretary/JobOrders/JobOrderTable";

import {
  getJobOrders,
  type JobOrder,
} from "../../api/JobOrderManagement/jobOrderApi";

// COMPONENT

export default function SecretaryJobOrderPage() {
  const toast = useToast();

  // STATES
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [workType, setWorkType] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD JOB ORDERS

  const loadJobOrders = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getJobOrders();

      setJobOrders(data);
    } catch (error: any) {
      toast({
        title: "Loading Failed",
        description:
          error?.response?.data?.message ||
          "Unable to load job orders.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // INITIAL LOAD

  useEffect(() => {
    loadJobOrders();
  }, [loadJobOrders]);

  // FILTER JOB ORDERS

  const filteredJobOrders = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return jobOrders.filter((jobOrder) => {
      const vehicleName = [
        jobOrder.vehicle?.brand?.brand,
        jobOrder.vehicle?.model?.model,
        jobOrder.vehicle?.variant?.variant,
      ]
        .filter(Boolean)
        .join(" ");

      const staffName = [
        jobOrder.assignedStaff?.first_name,
        jobOrder.assignedStaff?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      const request = jobOrder.requestService;
      const customer = request?.vehicle_release?.sale?.reservation?.customer;
      const requestText = [
        request?.service_request_number,
        request?.request_detail,
        customer?.first_name,
        customer?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSource =
        !source ||
        (source === "customer" ? Boolean(request) : !request);

      const matchesSearch =
        !keyword ||
        String(jobOrder.job_order_no)
          .toLowerCase()
          .includes(keyword) ||
        vehicleName.toLowerCase().includes(keyword) ||
        requestText.includes(keyword) ||
        staffName.toLowerCase().includes(keyword) ||
        jobOrder.description
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        !status || jobOrder.status === status;

      const matchesWorkType =
        !workType || jobOrder.work_type === workType;

      return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesWorkType
      );
    });
  }, [jobOrders, search, source, status, workType]);

  // RENDER

  return (
    <>
      {/* PAGE HEADER */}

      <PageHeader
        title="Job Orders"
        subtitle="Shop work in progress: who is on it, parts used and total cost."
        onRefresh={loadJobOrders}
        refreshing={loading}
      />
      <Grid
        mt={4}
        gap={4}
        templateColumns="1fr"
      >
        {/* TOOLBAR */}

        <GridItem minW={0}>
          <AdminJobOrderToolbar
            search={search}
            status={status}
            workType={workType}
            source={source}
            onSourceChange={setSource}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onWorkTypeChange={setWorkType}
            onReload={loadJobOrders}
          />
        </GridItem>

        {/* TABLE */}

        <GridItem minW={0}>
          <AdminJobOrderTable
            jobOrders={filteredJobOrders}
            onChanged={loadJobOrders}
          />
        </GridItem>
      </Grid>
    </>
  );
}